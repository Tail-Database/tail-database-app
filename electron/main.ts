import { readFileSync } from 'fs';
import { homedir } from "os";
import * as path from 'path';
import { app, ipcMain, BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { DataLayer } from '../src/datalayer/rpc/data_layer';
import { Tail } from '../src/models/tail/model';

process.on('uncaughtException', (e) => console.error(e));

// Temporary hacking this in here - will change later
const id = '073edb36a4a982c3d00999b1d925d304e7867afa68eb535e3071ee2f682700ea';

const chiaRootPath = path.resolve(
    homedir(),
    process.env["CHIA_ROOT"] || ".chia/mainnet"
);

const CONFIG_PATH = `${chiaRootPath}/config/ssl/full_node`;

const dl = new DataLayer({
    id,
    cert: readFileSync(`${CONFIG_PATH}/private_full_node.crt`),
    key: readFileSync(`${CONFIG_PATH}/private_full_node.key`),
    rejectUnauthorized: false
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


    ipcMain.handle('get-tails', () => tailStore.all());
    ipcMain.handle('get-tail', (_, hash) => tailStore.get(hash));

    // DevTools
    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

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
