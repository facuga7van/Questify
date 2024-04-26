import { app, BrowserWindow, ipcMain} from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
// import {getConnection} from '../src/Data/database';
// import { Task } from '../src/Data/Interfaces/taskTypes'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import fs from 'fs'

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, '../src/Assets/icon.png'),
    width: 650,
        height: 800,
        minWidth: 650,
        minHeight: 600,
        frame: false,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true, 
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

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
   win?.close();
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



 async function deleteLineFromJSON(tasksFilePath: fs.PathLike | fs.promises.FileHandle, taskIndex: number) {
  try {
    const data = await fs.promises.readFile(tasksFilePath, 'utf-8');
    const parsedData = JSON.parse(data);

    // Check if the line number is valid
    if (taskIndex < 1 || taskIndex > Object.keys(parsedData).length) {
      throw new Error(`Invalid line number: ${taskIndex}`);
    }

    // Convert the parsed data into an array of lines
    const lines = data.split('\n');

    // Remove the specified line from the array
    lines.splice(taskIndex - 1, 1);

    // Convert the modified line array back into a string
    const updatedContent = lines.join('\n');

    // Write the updated content to the file
    await fs.promises.writeFile(tasksFilePath, updatedContent);
  } catch (error) {
    console.error('Error deleting line from JSON:', error);
    throw error; // Re-throw the error to allow proper handling
  }
}

 ipcMain.on('deleteTask', async (event, id) => {
  try {
    const tasks = await getTasks();
    const filteredTasks = tasks.filter((task: { idTask: null; }) => task.idTask === id || task.idTask === null);


    if (filteredTasks.length === tasks.length) {
      console.log('Task not found for deletion.');
      event.sender.send('deleteTaskNotFound');
      return;
    }

    // Save the filtered tasks (modified approach)
    await saveTasks(filteredTasks);
    event.sender.send('deleteTaskSuccess', id);

    // **New: Delete the line from the JSON file based on the task ID**
    const taskIndex = tasks.findIndex((task: { idTask: any; }) => task.idTask === id);
    if (taskIndex !== -1) {
      try {
        await deleteLineFromJSON(tasksFilePath, taskIndex + 1); // Line numbers start at 1
        console.log(`Task with ID ${id} deleted from line ${taskIndex + 1} in tasks.json`);
      } catch (error) {
        console.error('Error deleting line from JSON:', error);
        // Handle potential errors during line deletion (e.g., send error message to renderer)
      }
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    event.sender.send('deleteTaskError', (error as Error).message);
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
 

app.whenReady().then(createWindow)
