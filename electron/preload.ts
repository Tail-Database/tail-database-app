import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('taildatabase', {
    getTail: (hash: string) => ipcRenderer.invoke('get-tail', hash),
    getTails: () => ipcRenderer.invoke('get-tails')
});
