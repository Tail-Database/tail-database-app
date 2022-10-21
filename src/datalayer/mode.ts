import { InsertResponse, UpdateResponse } from './rpc/data_layer';

export interface Model<T> {
    insert(record: T): Promise<InsertResponse>;
    update(record: T): Promise<UpdateResponse>;
    get(key: string): Promise<T>;
    all(): Promise<T[]>;
}
