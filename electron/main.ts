import * as path from 'path';
import { app, ipcMain, BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { Coin, DataLayer, Tail, TailRecord } from '@tail-database/tail-database-client';
import { connectionOptions, store_id } from './config';
import { getNftUri } from './nft';
import { getTailReveal } from './cat';
import { Blockchain } from '../src/blockchain/rpc/blockchain';
import { synced } from './blockchain';
import { logger } from './logger';

process.on('uncaughtException', (e) => logger.error(e));

const coin = new Coin(connectionOptions);
const blockchain = new Blockchain(connectionOptions);
const dl = new DataLayer({
    id: store_id,
    ...connectionOptions
})

const tailStore = new Tail(dl);

let win: BrowserWindow | null = null;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Isolating context so our app is not exposed to random javascript executions making it safer
        }
    })

    if (isDev) {
        win.loadURL('http://localhost:3000/');
    } else {
        // 'build/index.html'
        win.loadURL(`file://${__dirname}/../`);
    }

    win.on('closed', () => win = null);

    // Hot Reloading
    if (isDev) {
        // 'node_modules/.bin/electronPath'
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
            forceHardReset: true,
            hardResetMethod: 'exit'
        });
    }

    ipcMain.handle('subscribe', (_, urls: string[] = []) => tailStore.subscribe(urls));
    ipcMain.handle('synced', () => synced(blockchain));
    ipcMain.handle('get-tails', () => tailStore.all());
    ipcMain.handle('get-tail', (_, hash) => tailStore.get(hash));
    ipcMain.handle('add-tail', (_, tailRecord: TailRecord) => tailStore.insert(tailRecord));
    ipcMain.handle('get-nft-uri', async (_, launcher_id: string) => getNftUri(launcher_id, coin));
    ipcMain.handle('get-tail-reveal', async (_, coin_id: string) => getTailReveal(coin_id, coin));

    // DevTools
    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => logger.info(`Added Extension:  ${name}`))
        .catch((err) => logger.info('An error occurred: ', err));

    if (isDev) {
        // win.webContents.openDevTools();
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
