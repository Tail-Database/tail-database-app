import { DataLayer, InsertResponse, RpcResponse, UpdateResponse } from '../../datalayer/rpc/data_layer';
import { Model } from '../../datalayer/model';
import { TailRecord } from './record';
import { TailSerializer } from './serializer';
import { parseTailRecords } from '../../taildatabase/data_validation';

export class Tail implements Model<TailRecord> {
    private readonly serializer = new TailSerializer();

    public constructor(public readonly dataLayer: DataLayer) { }

    public insert(tailRecord: TailRecord): Promise<InsertResponse> {
        return this.dataLayer.insert(
            tailRecord.hash,
            this.serializer.encode(tailRecord)
        );
    }

    public update(tailRecord: TailRecord): Promise<UpdateResponse> {
        return this.dataLayer.batch_update(
            [
                {
                    action: 'delete',
                    key: tailRecord.hash
                },
                {
                    action: 'insert',
                    key: tailRecord.hash,
                    value: this.serializer.encode(tailRecord)
                }
            ]
        );
    }

    public async get(hash: string): Promise<TailRecord> {
        const data = await this.dataLayer.get_value(hash);

        return this.serializer.decode(data.value);
    }

    public async all(): Promise<TailRecord[]> {
        const kvs = await this.dataLayer.get_keys_values();
        const values = (kvs.keys_values || []).map(kv => kv.value.slice(2));

        return parseTailRecords([...this.serializer.decode_all(values)]);
    }
    
    public async subscribe(urls: string[] = []): Promise<RpcResponse> {
        return this.dataLayer.subscribe(urls);
    }
}
