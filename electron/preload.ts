import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('taildatabase', {
    getTails: () => ipcRenderer.invoke('get-tails')
});
