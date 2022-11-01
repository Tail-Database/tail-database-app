import { readFileSync } from 'fs';
import { homedir } from "os";
import * as path from 'path';
import toml from 'toml';

const config = toml.parse(readFileSync(path.resolve(process.cwd(), 'electron/', './config.toml')).toString('utf-8'))

const chiaRootPath = path.resolve(
    homedir(),
    process.env["CHIA_ROOT"] || ".chia/mainnet"
);

const CONFIG_PATH = `${chiaRootPath}/config/ssl/full_node`;

export const connectionOptions = {
    cert: readFileSync(`${CONFIG_PATH}/private_full_node.crt`),
    key: readFileSync(`${CONFIG_PATH}/private_full_node.key`),
    rejectUnauthorized: false
};

export const store_id = config.network == 'mainnet' ? config.mainnet.store_id  : config.testnet10.store_id;
