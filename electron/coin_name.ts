import { createHash } from 'crypto';

const strip_hex_prefix = (str: string) => str.startsWith('0x') ? str.slice(2) : str;
const hex_to_buffer = (hex: string) => Buffer.from(strip_hex_prefix(hex), 'hex');
const check = (val: any) => (val & 0x80 ? 0xff : 0);
const hash = (...data: Buffer[]) => {
    const hash = createHash('sha256');

    hash.update(Buffer.concat([...data]));

    return hash.digest().toString('hex');
}
export const coin_name = (
    amount: string,
    parent_coin_info: string,
    puzzle_hash: string,
): string => {
    const initialAmountBuffer = Buffer.alloc(16);

    initialAmountBuffer.writeBigUInt64BE(BigInt(amount), 8);

    let amountBuffer = initialAmountBuffer;

    while (
        amountBuffer.byteLength > 1 &&
        amountBuffer[0] === check(amountBuffer[1])
    ) {
        amountBuffer = amountBuffer.slice(1);
    }

    return `0x${hash(
        hex_to_buffer(parent_coin_info),
        hex_to_buffer(puzzle_hash),
        amountBuffer,
    )}`;
};
