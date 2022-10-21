export interface Serializer<T> {
    encode(record: T): string;
    decode(hex: string): T;
    decode_all(values: string[]): Generator<T>
}
