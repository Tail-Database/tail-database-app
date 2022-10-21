import msgpack from 'msgpack-lite';
import { Serializer } from '../../datalayer/serializer';
import { tailRecord, TailRecord } from './record';

export class TailSerializer implements Serializer<TailRecord> {
    public encode(tailRecord: TailRecord): string {
        return msgpack.encode(tailRecord).toString('hex');
    }

    public decode(value: string): TailRecord {
        const data = msgpack.decode(Buffer.from(value, 'hex'));

        if (!tailRecord(data)) {
            throw Error(`Invalid TAIL data in store: ${value}`);
        }

        return data;
    }

    public *decode_all(values: string[]): Generator<TailRecord> {
        for (const value of values) {
            try {
                yield this.decode(value);
            } catch (e) {
                console.log(`Invalid data in store: ${value}`);
            }
        }
    }
}
