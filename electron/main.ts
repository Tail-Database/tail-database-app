import { readFileSync } from 'fs';
import { homedir } from "os";
import * as path from 'path';
import { SExp, convert_atom_to_bytes } from 'clvm';
import { app, ipcMain, BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { Coin } from '../src/coin/rpc/coin';
import { DataLayer } from '../src/datalayer/rpc/data_layer';
import { Tail } from '../src/models/tail/model';
import { TailRecord } from '../src/models/tail/record';
import { coin_name } from './coin_name';
import { hex_to_program, uncurry } from './clvm';
import { NFT_STATE_LAYER_MOD, SINGLETON_MOD } from './puzzles';

process.on('uncaughtException', (e) => console.error(e));

// Temporary hacking this in here - will change later
const id = '073edb36a4a982c3d00999b1d925d304e7867afa68eb535e3071ee2f682700ea';

const chiaRootPath = path.resolve(
    homedir(),
    process.env["CHIA_ROOT"] || ".chia/mainnet"
);

const CONFIG_PATH = `${chiaRootPath}/config/ssl/full_node`;

const connectionOptions = {
    cert: readFileSync(`${CONFIG_PATH}/private_full_node.crt`),
    key: readFileSync(`${CONFIG_PATH}/private_full_node.key`),
    rejectUnauthorized: false
};

const coin = new Coin(connectionOptions);
const dl = new DataLayer({
    id,
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


    ipcMain.handle('get-tails', () => tailStore.all());
    ipcMain.handle('get-tail', (_, hash) => tailStore.get(hash));
    ipcMain.handle('add-tail', (_, tailRecord: TailRecord) => tailStore.insert(tailRecord));
    // Todo: encapsulate entire nft reveal soits done in this thread rather than orchestrating from UI
    ipcMain.handle('get-nft-uri', async(_, launcher_id: string) => {
        const { coin_records } = await coin.get_coin_records_by_parent_ids([launcher_id]);
        const result = await coin.get_puzzle_and_solution(coin_name(String(coin_records[0].coin.amount), coin_records[0].coin.parent_coin_info, coin_records[0].coin.puzzle_hash), coin_records[0].spent_block_index);
        const outer_puzzle = hex_to_program(result.coin_solution.puzzle_reveal);
        const outer_puzzle_uncurry = uncurry(outer_puzzle);

        if (outer_puzzle_uncurry) {
            const [mod, curried_args] = outer_puzzle_uncurry;

            if (mod == SINGLETON_MOD) {
                const [_, singleton_inner_puzzle] = curried_args;

                const singleton_inner_puzzle_1 = hex_to_program(singleton_inner_puzzle);
                const singleton_inner_puzzle_1_uncurry = uncurry(singleton_inner_puzzle_1);

                if (singleton_inner_puzzle_1_uncurry) {
                    const [mod, curried_args] = singleton_inner_puzzle_1_uncurry;

                    if (mod == NFT_STATE_LAYER_MOD) {
                        const [_, metadata] = curried_args;

                        const metadata_program = hex_to_program(metadata);

                        for (const data of metadata_program.as_iter()) {
                            const pair = data.as_pair();

                            if (pair) {
                                const [type, value]: SExp[] = pair;

                                console.log(type.atom?.decode())

                                if (type.atom?.decode() == 'u') {
                                    if (value.pair) {
                                        // URI
                                        return value.pair[0].atom.decode();
                                    }
                                }
                            }
                        }
                    }
                    
                }
                
            }
        }

        return null;
    });

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
