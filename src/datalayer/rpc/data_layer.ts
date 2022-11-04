import { Agent } from 'https';
import axios from 'axios';

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = '8562';

export interface RpcResponse {
    success: boolean;
}

export interface TerminalNode {
    atom: null;
    hash: string;
    key: string;
    value: string;
}

export interface KeysValuesResponse extends RpcResponse {
    keys_values: TerminalNode[];
}

export interface ValueResponse extends RpcResponse {
    value: string;
}

export interface InsertResponse extends RpcResponse {
    tx_id: string;
}

export interface UpdateResponse extends RpcResponse {
    tx_id: string;
}

interface DeleteAction {
    action: 'delete';
    key: string;
}

interface InsertAction {
    action: 'insert';
    key: string;
    value: string;
}

type Change = DeleteAction | InsertAction;

interface DataLayerConnectionOptions {
    id: string;
    cert: Buffer;
    key: Buffer;
    hostname?: string;
    port?: number;
    rejectUnauthorized: boolean;
}

export class DataLayer {
    private readonly agent: Agent;

    public constructor(private readonly options: DataLayerConnectionOptions) {
        this.agent = new Agent({
            cert: options.cert,
            key: options.key,
            rejectUnauthorized: options.rejectUnauthorized,
        });
    }

    public get_keys_values(): Promise<KeysValuesResponse> {
        return this.request<KeysValuesResponse>('get_keys_values', { id: this.options.id });
    }

    public insert(key: string, value: string): Promise<InsertResponse> {
        return this.request<InsertResponse>('insert', { id: this.options.id, key, value });
    }

    public batch_update(changelist: Change[]): Promise<UpdateResponse> {
        return this.request<UpdateResponse>('batch_update', { id: this.options.id, changelist });
    }

    public get_value(key: string): Promise<ValueResponse> {
        return this.request<ValueResponse>('get_value', { id: this.options.id, key });
    }

    public subscribe(urls: string[] = []): Promise<RpcResponse> {
        return this.request<RpcResponse>('subscribe', { id: this.options.id, urls });
    }

    private async request<T>(route: string, body: Record<string, any>): Promise<T> {
        const { data } = await axios.post<T>(`https://${this.options.hostname || DEFAULT_HOSTNAME}:${this.options.port || DEFAULT_PORT}/${route}`, body, {
            httpsAgent: this.agent,
        });

        return data;
    }
}
