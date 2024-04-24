import { app, BrowserWindow, ipcMain} from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {getConnection} from '../src/Data/database';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

 ipcMain.on('getTasks', async (event: Electron.IpcMainEvent) => {
  try {
    const conn = await getConnection();

    // Ejecutar la consulta SQL para obtener las tareas
    conn.query('SELECT * FROM task', (error, results: any[], fields: any) => {
      if (error) {
        // Type assertion para especificar el tipo de error
        const err: Error = error as Error;
        
        // En caso de error, responder con el mensaje de error
        console.error('Error:', err);
        event.reply('tasks-error', err.message);
      } else {
        // En caso de éxito, responder con los resultados
        console.log('Get Success');
        event.reply('showTasks', results);
      }
    });
  } catch (error) {
    // En caso de error al establecer la conexión
    console.error('Connection refused:', error);
  }
});

ipcMain.on('addTask', async (event, newTaskJSON) => {
  try {
    const newTask = JSON.parse(newTaskJSON);
    const conn = await getConnection(); // Supongamos que esta función obtiene la conexión a la base de datos
    const result = await conn.query('INSERT INTO task SET ?', newTask);
    console.log('Task added.');

    // Envía un mensaje de confirmación al proceso de renderizado
    event.sender.send('refreshTasks');
  } catch (error) {
    console.error('Something went wrong in the insert:', error);
  }
});


app.whenReady().then(createWindow)
