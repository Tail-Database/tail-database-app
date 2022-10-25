import { contextBridge, ipcRenderer } from 'electron';
import { TailRecord } from '../src/models/tail/record';

contextBridge.exposeInMainWorld('taildatabase', {
    addTail: (tailRecord: TailRecord) => ipcRenderer.invoke('add-tail', tailRecord),
    getTail: (hash: string) => ipcRenderer.invoke('get-tail', hash),
    getTails: () => ipcRenderer.invoke('get-tails'),
    getNftUri: (launcher_id: string) => ipcRenderer.invoke('get-nft-uri', launcher_id),
});
