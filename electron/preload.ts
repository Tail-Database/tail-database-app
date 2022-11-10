import { contextBridge, ipcRenderer } from 'electron';
import { TailRecord } from '@tail-database/tail-database-client';

contextBridge.exposeInMainWorld('taildatabase', {
    addTail: (tailRecord: TailRecord) => ipcRenderer.invoke('add-tail', tailRecord),
    getTail: (hash: string) => ipcRenderer.invoke('get-tail', hash),
    getTails: () => ipcRenderer.invoke('get-tails'),
    getNftUri: (launcher_id: string) => ipcRenderer.invoke('get-nft-uri', launcher_id),
    getTailReveal: (coin_id: string) => ipcRenderer.invoke('get-tail-reveal', coin_id),
    synced: () => ipcRenderer.invoke('synced'),
    subscribe: (urls: string[] = []) => ipcRenderer.invoke('subscribe', urls),
});
