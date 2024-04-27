import { app, BrowserWindow, ipcMain, Tray, nativeImage, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'

// import appIcon from '../resources/icon.ico'
const __dirname = path.dirname(fileURLToPath(import.meta.url))


process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
// const appIcon = ;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
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
  win?.hide();
});


  //  const tasksFilePath = path.join(__dirname, './tasks.json');        // DESCOMENTAR ESTE PARA DEV
  const tasksFilePath = path.join(app.getPath('userData'), 'tasks.json');               // DESCOMENTAR ESTE PARA BUILD


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

// Function to generate a unique ID (consider using a stronger random number generator for production)
async function getNextTaskId() {
  let lastId = 0; // Default to 1 if no tasks exist
  try {
    const tasks = await getTasks();

    // Check if the file is empty
    if (tasks.length === 0) {
      // If empty, set lastId to 1
      lastId = 1;
    } else {
      // If not empty, use the existing logic
      lastId = Math.max(...tasks.map((task: { idTask: any; }) => task.idTask || 0)) || 1;
    }
  } catch (error) {
    console.error('Error getting last ID:', error);
  }
  return lastId + 1;
}



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
    const nextId = await getNextTaskId(); // Generate unique ID (optional)

    const tasks = await getTasks();

    // Check if a task with the same ID already exists
    const existingTaskIndex = tasks.findIndex((task: { idTask: any; }) => task.idTask === newTask.idTask);

    if (existingTaskIndex !== -1 && existingTaskIndex !== null && existingTaskIndex !== undefined) {
      // Update the existing task
      tasks[existingTaskIndex] = { ...tasks[existingTaskIndex], ...newTask }; // Merge updated data
      console.log(`Task with ID ${newTask.idTask} updated.`);
    } else {
      // If no existing ID, assign the generated ID (if applicable) and add the new task
      newTask.idTask = nextId || 1; // Use generated ID or calculate based on length
      tasks.push(newTask);
      console.log(`Task with ID ${event} added.`);
    }

    await saveTasks(tasks); // Pass the updated tasks array
    win?.webContents.send('taskAdded'); // Notify the renderer process (optional)


  } catch (error) {
    console.error('Error adding task:', error);
  }
});

ipcMain.on('deleteTask', async (event, ids) => {
  try {
    const tasks = await getTasks();

    // Check if ids is an array
    if (!Array.isArray(ids)) {
      console.error('Invalid ID format. Expected an array of IDs.');
      event.sender.send('deleteTaskError', 'Invalid ID format.');
      return;
    }

    // Initialize an empty array to store deleted task IDs
    const deletedIDs = [];

    // Iterate through the IDs array
    for (const id of ids) {
      // Find the task index based on the ID
      const taskIndex = tasks.findIndex((task: { idTask: any }) => task.idTask === id);

      // Check if the task was found
      if (taskIndex !== -1) {
        // Remove the task from the array
        tasks.splice(taskIndex, 1);

        // Add the deleted ID to the deletedIDs array
        deletedIDs.push(id);
      }
    }

    // Save the updated tasks array
    await saveTasks(tasks);

    // Send a success message with an array of deleted IDs
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

    // Create a copy of the task object to modify
    const taskToUpdate = { ...tasks[taskIndex] };

    // Invert the taskstatus property
    taskToUpdate.TaskStatus = !taskToUpdate.TaskStatus;

    // Update the task at the specific index in the original array
    tasks[taskIndex] = taskToUpdate;

    console.log(`Task with ID ${id} status updated.`);

    // Save the updated tasks array
    await saveTasks(tasks);
    win?.webContents.send('taskAdded'); // Notify the renderer process (optional)
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

autoUpdater.on("update-available", (info) =>{
  win?.webContents.send('checkingUdp', 'Update available')
    console.log('available', info)
  let pth = autoUpdater.downloadUpdate();
  win?.webContents.send('checkingUdp', pth)
})
autoUpdater.on("update-not-available", (info) =>{
  win?.webContents.send('checkingUdp', '')
    console.log('not',info)
})
autoUpdater.on("update-downloaded", (info) =>{
  win?.webContents.send('checkingUdp', 'Installing...')
    console.log('checking',info)
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
      let tray: Tray;
      win.webContents.send('checkingUdp', 'Checking for updates');
      tray = new Tray(nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, '../src/Assets/icon.png')))
      tray.setToolTip('Questify')
      tray.on('double-click',()=>{
        win?.isVisible() ? win?.hide() : win?.show();
      })
      let template = [{label:'exit',
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

