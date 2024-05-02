import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'
import OpenAI from "openai";
import { Task } from '../src/Data/Interfaces/taskTypes';
import apikey from '../apikey.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'] = apikey.openaiApiKey,
});


process.env.APP_ROOT = path.join(__dirname, '..')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')



autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.png');

let win: BrowserWindow | null

function createWindow() {
  if (win) {
    win.focus();
    return;
  }


  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, '../src/Assets/icon.png'),
    width: 650,
    height: 800,
    minWidth: 650,
    minHeight: 720,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  // Test active push message to Renderer-process.


  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

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
const xpFilePath = path.join(__dirname, './xp.json');
const tasksFilePath = path.join(__dirname, './tasks.json');        // DESCOMENTAR ESTE PARA DEV

//  const configFilePath = path.join(app.getPath('userData'), 'config.json');
//  const tasksFilePath = path.join(app.getPath('userData'), 'tasks.json');               // DESCOMENTAR ESTE PARA BUILD
//  const xpFilePath = path.join(app.getPath('userData'), 'xp.json');

// Function to read tasks from the JSON file
function getTasks() {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf-8');
    return JSON.parse(data) || []; // Return empty array if file doesn't exist
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

// Function to save tasks to the JSON file
async function saveTasks(tasks: any) {
  try {
    const data = JSON.stringify(tasks, null, 2); // Pretty-print for readability
    fs.writeFileSync(tasksFilePath, data);
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

async function getXp() {
  try {
    const data = fs.readFileSync(xpFilePath, 'utf-8');
    const parsedData = JSON.parse(data); // Parse the JSON string
    const newXp = parsedData.xp
    console.log('y ahora2 ' + newXp)
    return Number(newXp); // Return only the value of "xp"
  } catch (error) {
    console.error('Error reading xp:', error);
    return 0; // Return 0 on error
  }
}


async function addXp(newXp: number) {
  try {
    const currentXp = await getXp();
    console.log('y ahora ' + currentXp)
    const totalXp = await Number(currentXp) + Number(newXp);
    console.log('y ahora ' + totalXp)
    const data = JSON.stringify({ xp: totalXp }); // Update only the xp property

    await fs.promises.writeFile(xpFilePath, data); // Use promises for safer async operations
  } catch (error) {
    console.error('Error saving xp:', error);
  }

}

function readConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config file:', error);
    return { keepTrayActive: true }; // Set default if error occurs
  }
}



async function getNextTaskId() {
  let lastId = 0;
  try {
    const tasks = await getTasks();

    if (tasks.length === 0) {
      lastId = 1;
    } else {
      lastId = Math.max(...tasks.map((task: { idTask: any; }) => task.idTask || 0)) || 1;
    }
  } catch (error) {
    console.error('Error getting last ID:', error);
  }
  return lastId + 1;
}

async function findDifficulty(task: Task) {
  const completion = await openai.chat.completions.create({
    max_tokens: 1,
    messages: [{ role: "system", content: `Your response must be just a single number, ommit anything else. Estimate difficulty (1-10):\n\nTask Name: ${task.TaskName}\n\nTask Description: ${task.TaskDesc}. Number:` }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
  // if (1>2){
  //   console.log(task)
  // }
  // return Math.floor(Math.random() * 10) + 1
}
ipcMain.on('getXP', async (event: Electron.IpcMainEvent) => {
  try {
    const xp = await getXp();
    event.reply('sendXP', xp);
    console.log('exp: ' + xp);
  } catch (error) {
    console.error('Connection refused:', error);
    event.reply('xp-error', (error as Error).message); // Send error message
  }
})

ipcMain.on('getTasks', async (event: Electron.IpcMainEvent) => {
  try {
    const tasks = await getTasks();
    event.reply('showTasks', tasks); // Send tasks to the renderer
  } catch (error) {
    console.error('Connection refused:', error);
    event.reply('tasks-error', (error as Error).message); // Send error message
  }
});

ipcMain.on('addTask', async (event, newTaskJSON) => {
  try {
    const newTask = JSON.parse(newTaskJSON);
    const nextId = await getNextTaskId();
    if (1 > 2) {
      console.log(event)
    }
    console.log(newTask)
    const tasks = await getTasks();


    const existingTaskIndex = tasks.findIndex((task: { idTask: any; }) => task.idTask === newTask.idTask);

    if (existingTaskIndex !== -1 && existingTaskIndex !== null && existingTaskIndex !== undefined) {
      // Update 
      newTask.TaskDiff = Number(await findDifficulty(newTask));
      tasks[existingTaskIndex] = { ...tasks[existingTaskIndex], ...newTask }; // Merge updated data
      console.log(`Task with ID ${newTask.idTask} updated.`);
    } else {
      // Insert 
      newTask.TaskDiff = Number(await findDifficulty(newTask));
      newTask.idTask = nextId || 1;
      tasks.push(newTask);
      console.log(`Task with ID ${newTask} added.`);
    }

    await saveTasks(tasks);
    win?.webContents.send('taskAdded');


  } catch (error) {
    console.error('Error adding task:', error);
  }
});

ipcMain.on('deleteTask', async (event, ids) => {
  try {
    const tasks = await getTasks();

    if (!Array.isArray(ids)) {
      console.error('Invalid ID format. Expected an array of IDs.');
      event.sender.send('deleteTaskError', 'Invalid ID format.');
      return;
    }

    const deletedIDs = [];

    for (const id of ids) {
      const taskIndex = tasks.findIndex((task: { idTask: any }) => task.idTask === id);
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        deletedIDs.push(id);
      }
    }
    await saveTasks(tasks);
    event.sender.send('deleteTaskSuccess', deletedIDs);
  } catch (error) {
    console.error('Error deleting task:', error);
    event.sender.send('deleteTaskError', (error as Error).message);
  }
});



ipcMain.on('changeStatusTask', async (event, id) => {
  try {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex((task: { idTask: any; }) => task.idTask === id);
    if (taskIndex === -1) {
      console.log('Task not found for update.');
      event.sender.send('editTaskNotFound');
      return;
    }

    const taskToUpdate = { ...tasks[taskIndex] };
    taskToUpdate.TaskStatus = !taskToUpdate.TaskStatus;
    const xpToAdd = taskToUpdate.TaskStatus ? taskToUpdate.TaskDiff * 7 : -taskToUpdate.TaskDiff * 7; // Add/subtract XP based on new status
    tasks[taskIndex] = taskToUpdate;

    console.log(`Task with ID ${id} status updated.`);
    await saveTasks(tasks);
    await addXp(Number(xpToAdd));
    win?.webContents.send('changeXP', Number(xpToAdd));
    win?.webContents.send('taskAdded');
  } catch (error) {
    console.error('Error updating task status:', error);
    event.sender.send('editTaskError', (error as Error).message);
  }
});


ipcMain.on('editTask', async (event, id) => {
  try {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex((task: { idTask: any; }) => task.idTask === id);
    console.log(taskIndex)
    if (taskIndex === -1) {
      console.log('Task not found for edit.');
      event.sender.send('editTaskNotFound');
      return;
    }

    win?.webContents.send('sendTaskEdit', tasks[taskIndex]); // Send the task object
  } catch (error) {
    console.error('Error fetching task for edit:', error);
    event.sender.send('editTaskError', (error as Error).message);
  }
});

autoUpdater.on("update-available", (info) => {
  win?.webContents.send('checkingUdp', 'Update available')
  console.log('available', info)
  let pth = autoUpdater.downloadUpdate();
  win?.webContents.send('checkingUdp', pth)
})
autoUpdater.on("update-not-available", (info) => {
  win?.webContents.send('checkingUdp', '')
  console.log('not', info)
})
autoUpdater.on("update-downloaded", (info) => {
  win?.webContents.send('checkingUdp', 'Installing...')
  console.log('checking', info)
})
autoUpdater.on('error', (error) => {
  win?.webContents.send('checkingUdp', error)
  console.error('Error during update check:', error);
});
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();

  win?.webContents.on('did-finish-load', () => {

    // Check if win is not null before accessing its properties
    if (win) {
      win.webContents.send('checkingUdp', 'Checking for updates');


      const tray = new Tray(nativeImage.createFromPath(iconPath));
      tray.setImage(iconPath);

      tray.setToolTip('Questify');
      tray.on('double-click', () => {
        win?.isVisible() ? win?.hide() : win?.show();
      });

      let config = readConfig();


      let template = [{
      label: config.keepTrayActive ? 'Disable Tray' : 'Enable Tray',  // Dynamic label based on config
      click: async () => {
        config.keepTrayActive = !config.keepTrayActive;  // Toggle the setting
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));  // Write the updated config
        // Update the tray menu label based on the new setting
        template[0].label = config.keepTrayActive ? 'Disable Tray' : 'Enable Tray';
        contextMenu = Menu.buildFromTemplate(template);
        tray.setContextMenu(contextMenu);
      }
    },
    {
      label: 'Exit',
      click: async () => {
          win?.close();
      }
    }];
    let contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
    } else {
      console.error('Window not yet created. Unable to send message.');
    }
  });


});

