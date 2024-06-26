import { ipcRenderer, contextBridge } from 'electron';

type IpcRendererEvent = import('electron').IpcRendererEvent;
ipcRenderer.removeAllListeners('deleteTaskSuccess');
ipcRenderer.removeAllListeners('sendTaskEdit');
ipcRenderer.removeAllListeners('showTasks');
ipcRenderer.removeAllListeners('askAdded');
ipcRenderer.removeAllListeners('syncTasksBeforeQuit');
ipcRenderer.removeAllListeners('syncTasksBeforeQuitComplete');
ipcRenderer.removeAllListeners('syncTasksSuccess');
ipcRenderer.removeAllListeners('sendXP');
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  removeAllListeners(channel: string) {
    ipcRenderer.removeAllListeners(channel);
  },


});

export type { IpcRendererEvent };
