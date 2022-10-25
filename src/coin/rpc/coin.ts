import { Agent } from 'https';
import axios from 'axios';

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = '8555';

interface RpcResponse {
    success: boolean;
}

interface CoinRecord {
    coin: {
        puzzle_hash: string;
        parent_coin_info: string;
        amount: number;
    };
    confirmed_block_index: number;
    spent_block_index: number;
    coinbase: boolean;
    timestamp: number;
}

interface CoinSpend {
    coin: {
        puzzle_hash: string;
        parent_coin_info: string;
        amount: number;
    };
    puzzle_reveal: string;
    solution: string;
}

export interface GetCoinRecordResponse extends RpcResponse {
    coin_record: CoinRecord;
}

export interface GetCoinRecordsByParentIdsResponse extends RpcResponse {
    coin_records: CoinRecord[];
}

export interface GetPuzzleAndSolutionResponse extends RpcResponse {
    coin_solution: CoinSpend;
}

interface CoinConnectionOptions {
    cert: Buffer;
    key: Buffer;
    hostname?: string;
    port?: number;
    rejectUnauthorized: boolean;
}

export class Coin {
    private readonly agent: Agent;

    public constructor(private readonly options: CoinConnectionOptions) {
        this.agent = new Agent({
            cert: options.cert,
            key: options.key,
            rejectUnauthorized: options.rejectUnauthorized,
        });
    }

    public get_coin_record_by_name(name: string): Promise<GetCoinRecordResponse> {
        return this.request<GetCoinRecordResponse>('get_coin_record_by_name', { name });
    }

    public get_coin_records_by_parent_ids(parent_ids: string[]): Promise<GetCoinRecordsByParentIdsResponse> {
        return this.request<GetCoinRecordsByParentIdsResponse>('get_coin_records_by_parent_ids', { parent_ids, include_spent_coins: true });
    }

    public get_puzzle_and_solution(coin_id: string, height: number): Promise<GetPuzzleAndSolutionResponse> {
        console.log('height', height);
        return this.request<GetPuzzleAndSolutionResponse>('get_puzzle_and_solution', { coin_id, height });
    }

    private async request<T>(route: string, body: Record<string, any>): Promise<T> {
        const { data } = await axios.post<T>(`https://${this.options.hostname || DEFAULT_HOSTNAME}:${this.options.port || DEFAULT_PORT}/${route}`, body, {
            httpsAgent: this.agent,
        });

        return data;
    }
}
