import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  MenuItemConstructorOptions,
  dialog,
} from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import { autoUpdater } from "electron-updater";
import OpenAI from "openai";
import { Task } from "../src/Data/Interfaces/taskTypes";
import dotenv from "dotenv";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc } from "firebase/firestore";
import {db} from '../src/Data/firebase';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;
const iconPath = path.join(process.env.VITE_PUBLIC, "icon.png");
 const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });
let win: BrowserWindow | null;
let updateCheck = false;
let updateFound = false;

function createWindow() {
  if (win) {
    win.focus();
    return;
  } else {
    win = new BrowserWindow({
      icon: path.join(process.env.VITE_PUBLIC, "../src/Assets/icon.png"),
      width: 650,
      height: 800,
      minWidth: 650,
      minHeight: 500,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.mjs"),
      },
    });

    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL);
    } else {
      win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("minimizeApp", () => {
  win?.minimize();
});
ipcMain.on("closeApp", () => {
  let config = readConfig();
  if (config.keepTrayActive) {
    win?.hide();
  } else {
    win?.close();
  }
});


  const configFilePath = path.join(__dirname, './config.json');

// const configFilePath = path.join(app.getPath("userData"), "config.json");
// const tasksFilePath = path.join(app.getPath("userData"), "tasks.json"); // DESCOMENTAR ESTE PARA BUILD
// const xpFilePath = path.join(app.getPath("userData"), "xp.json");

async function getTasks(userId:string) {

  try {
    const tasksCollectionRef = collection(db, "questify", userId, "tasks");
    const q = query(tasksCollectionRef); // Filter by userId

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return tasks;
  } catch (error) {
    console.error("Error getting tasks:", error);
    return []; // Return empty array on error
  }
}
async function getTaskById(userId: string, id: string) {
  try {
    const taskDocRef = doc(collection(db, "questify", userId, "tasks"), id);
    const taskSnapshot = await getDoc(taskDocRef);

    if (taskSnapshot.exists()) {
      const taskFounded = taskSnapshot.data()
      taskFounded.id = id
      return taskFounded; // Return the entire document data
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting task by id:", error);
    return null;
  }
}


async function addTask(task:any,userId:any){
  
  if (task.id){
    console.log('actualzio')
      try {
        await setDoc(doc(db, "questify", userId, "tasks",task.id), {
          TaskName: task.TaskName,
          TaskDesc: task.TaskDesc,
          TaskDiff: task.TaskDiff,
          TaskStatus: task.TaskStatus,
          TaskDate: serverTimestamp()
      });
        return true;
    } catch (e) {
      
    return false;
    }
  }else{
    console.log('agrego')
    try {
      await addDoc(collection(db, "questify", userId, "tasks"), {
        TaskName: task.TaskName,
        TaskDesc: task.TaskDesc,
        TaskDiff: task.TaskDiff,
        TaskStatus: task.TaskStatus,
        TaskDate: serverTimestamp()
    });
      return true;
  } catch (e) {
    
  return false;
  }

}
}
async function getXp(userId: string): Promise<number> {
  try {
    const userRef = doc(collection(db, "questify"), userId); // Use userId to construct path
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData && userData.currentXp) {
        return Number(userData.currentXp); // Return the user's current XP
      } else {
        console.warn("User data missing 'currentXp' field");
        return 0; // Return 0 if 'currentXp' is missing
      }
    } else {
      console.warn("User document not found");
      return 0; // Return 0 if the user document doesn't exist
    }
  } catch (error) {
    console.error("Error getting user XP:", error);
    return 0; // Return 0 on any other error
  }
}


async function addXp(newXp: number, userId:string) {
  try {
    const currentXp = await getXp(userId);

    const totalXp = currentXp + newXp;

    const userRef = doc(collection(db, "questify"), userId);
    await setDoc(userRef, { currentXp: totalXp }, { merge: true });

    win?.webContents.send("changeXP", newXp);
  } catch (error) {
    console.error("Error saving XP to Firestore:", error);
  }
}


function readConfig() {
  try {
    const data = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading config file:", error);
    return { keepTrayActive: true };
  }
}

async function findDifficulty(task: Task) {
  console.log(process.env.OPENAI_APIKEY);
  const completion = await openai.chat.completions.create({
    max_tokens: 1,
    messages: [
      {
        role: "system",
        content: `Your response must be just a single number, ommit anything else. Estimate difficulty (1-10):\n\nTask Name: ${task.TaskName}\n\nTask Description: ${task.TaskDesc}. Number:`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}

ipcMain.on("getXP", async (event: Electron.IpcMainEvent, userId:string) => {
  try {
    const xp = await getXp(userId);
    event.reply("sendXP", xp);
  } catch (error) {
    console.error("Connection refused:", error);
    event.reply("xp-error", (error as Error).message); // Send error message
  }
});

ipcMain.on("getTasks", async (event: Electron.IpcMainEvent, userId:string) => {
  try {
    const tasks = await getTasks(userId);
    event.reply("showTasks", tasks); // Send tasks to the renderer
  } catch (error) {
    console.error("Connection refused:", error);
    event.reply("tasks-error", (error as Error).message); // Send error message
  }
});

ipcMain.on("addTask", async (event, newTask) => {
  
    newTask.TaskDiff = Number(await findDifficulty(newTask));
    if (1>2){
      console.log(event)
    }
      const userId = newTask.TaskUser;
      const isok = await addTask(newTask,userId);
      if (isok){
        win?.webContents.send("taskAdded");
      }else{
        console.error("Connection refused:");
      }

});

// ipcMain.on("deleteTask", async (event, ids,userId) => {
  // try {
  //   const tasks = await getTasks(userId);

  //   if (!Array.isArray(ids)) {
  //     console.error("Invalid ID format. Expected an array of IDs.");
  //     event.sender.send("deleteTaskError", "Invalid ID format.");
  //     return;
  //   }

  //   const deletedIDs = [];

  //   for (const id of ids) {
  //     const taskIndex = tasks.findIndex(
  //       (task: { idTask: any }) => task.idTask === id
  //     );
  //     if (taskIndex !== -1) {
  //       tasks.splice(taskIndex, 1);
  //       deletedIDs.push(id);
  //     }
  //   }
  //   await saveTasks(tasks);
  //   event.sender.send("deleteTaskSuccess", deletedIDs);
  // } catch (error) {
  //   console.error("Error deleting task:", error);
  //   event.sender.send("deleteTaskError", (error as Error).message);
  // }
// });

ipcMain.on("changeStatusTask", async (event, id, userId ) => {
  try {
    const taskToUpd = await getTaskById(userId,id)

    if (taskToUpd){
      taskToUpd.id = id;
      taskToUpd.TaskStatus = !taskToUpd.TaskStatus;
    let xpToAdd = taskToUpd.TaskStatus
    ? taskToUpd.TaskDiff * 7
    : -taskToUpd.TaskDiff * 7;
    console.log(`Task with ID ${id} status updated.`);
    await addTask(taskToUpd,userId);
    await addXp(Number(xpToAdd),userId);
    win?.webContents.send("changeXP", Number(xpToAdd));
    win?.webContents.send("taskAdded");
    }
  } catch (error) {
    console.error("Error updating task status:", error);
    event.sender.send("editTaskError", (error as Error).message);
  }
});

ipcMain.on("editTask", async (event, id,userId) => {
  try{
    const taskToEdit = await getTaskById(userId,id)
    console.log('editar')
    console.log(taskToEdit)
    win?.webContents.send("sendTaskEdit", taskToEdit);
  }catch(e){
    if (1>2){
      console.log(event)
    }
  }
});

autoUpdater.on("download-progress", (info) =>{
  win?.webContents.send("checkingUdp", "Installing...");
  console.log("not", info);
})
// autoUpdater.on("update-available", (info) => {
//   win?.webContents.send("checkingUdp", "Update available");
//   console.log("available", info);
//   let pth = autoUpdater.downloadUpdate();
//   win?.webContents.send("checkingUdp", pth);
// });
autoUpdater.on("update-not-available", (info) => {
  win?.webContents.send("checkingUdp", "");
  console.log("not", info);
});
// autoUpdater.on("update-downloaded", (info) => {
//   win?.webContents.send("checkingUdp", "Installing...");
//   console.log("checking", info);
// });
autoUpdater.on("error", (error) => {
  win?.webContents.send("checkingUdp", error);
  console.error("Error during update check:", error);
});

autoUpdater.on("update-available", (_event: any) => {
  win?.webContents.send("checkingUdp", "Installing...");
  const dialogOpts = {
    type: 'info' as const, // Set the type to one of the allowed values
    buttons: ['Ok'],
    title: `Questify Update Available`,
    message: `A new ${autoUpdater.channel} version download started.`,
  };
  if (!updateCheck) {
    dialog.showMessageBox(dialogOpts);
    updateCheck = true;
    let pth = autoUpdater.downloadUpdate();
    win?.webContents.send("checkingUdp", pth);
  }
});

autoUpdater.on("update-downloaded", (_event) => {
  if (!updateFound) {
      updateFound = true;

      setTimeout(() => {
          autoUpdater.quitAndInstall(true,true);
      }, 3500);
  }
});


app.whenReady().then( async() => {
  createWindow();

  autoUpdater.checkForUpdatesAndNotify();

  win?.webContents.on("did-finish-load", async () => {
    if (win) {
      win.webContents.send("checkingUdp", "Checking for updates");
      
      const tray = new Tray(nativeImage.createFromPath(iconPath));
      tray.setImage(iconPath);

      tray.setToolTip("Questify");
      tray.on("double-click", () => {
        win?.isVisible() ? win?.hide() : win?.show();
      });

      let config = readConfig();
      const version = app.getVersion();

      let template: MenuItemConstructorOptions[] = [
        { label: `Version: ${version}` },
        { type: "separator" },
        {
          label: "System Tray",
          type: "checkbox",
          checked: config.keepTrayActive,
          click: async () => {
            config.keepTrayActive = !config.keepTrayActive;
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

            template[2].checked = config.keepTrayActive;

            const contextMenu = Menu.buildFromTemplate(template);
            tray.setContextMenu(contextMenu);
          },
        },
        {
          label: "Always on top",
          type: "checkbox",
          checked: config.keepOnTop,
          click: async () => {
            config.keepOnTop = !config.keepOnTop;
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

            template[3].checked = config.keepOnTop;

            win?.setAlwaysOnTop(config.keepOnTop, "screen-saver", 1);
            const contextMenu = Menu.buildFromTemplate(template);
            tray.setContextMenu(contextMenu);
          },
        },
        {
          label: "Exit",
          click: async () => {
            win?.close();
          },
        },
      ];

      let contextMenu = Menu.buildFromTemplate(template);
      tray.setContextMenu(contextMenu);
    } else {
      console.error("Window not yet created. Unable to send message.");
    }
  });
});
