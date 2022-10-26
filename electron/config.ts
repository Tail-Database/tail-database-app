import { readFileSync } from 'fs';
import { homedir } from "os";
import * as path from 'path';

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
