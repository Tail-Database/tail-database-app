import { Blockchain } from '../src/blockchain/rpc/blockchain';

export const synced = async (blockchain: Blockchain) => {
    const result = await blockchain.get_blockchain_state();

    return result.success && result.blockchain_state.sync.synced;
};
