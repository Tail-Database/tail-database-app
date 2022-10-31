import { Agent } from 'https';
import axios from 'axios';

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = '8555';

interface RpcResponse {
    success: boolean;
}

export interface GetBlockchainStateResponse extends RpcResponse {
    blockchain_state: {
        sync: {
            synced: boolean;
        };
    };
}

interface CoinConnectionOptions {
    cert: Buffer;
    key: Buffer;
    hostname?: string;
    port?: number;
    rejectUnauthorized: boolean;
}

export class Blockchain {
    private readonly agent: Agent;

    public constructor(private readonly options: CoinConnectionOptions) {
        this.agent = new Agent({
            cert: options.cert,
            key: options.key,
            rejectUnauthorized: options.rejectUnauthorized,
        });
    }

    public get_blockchain_state(): Promise<GetBlockchainStateResponse> {
        return this.request<GetBlockchainStateResponse>('get_blockchain_state', {});
    }

    private async request<T>(route: string, body: Record<string, any>): Promise<T> {
        const { data } = await axios.post<T>(`https://${this.options.hostname || DEFAULT_HOSTNAME}:${this.options.port || DEFAULT_PORT}/${route}`, body, {
            httpsAgent: this.agent,
        });

        return data;
    }
}
