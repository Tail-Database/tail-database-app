import { SExp } from 'clvm';
import { Coin } from '../src/coin/rpc/coin';
import { hex_to_program, uncurry } from './clvm';
import { coin_name } from './coin_name';
import { NFT_STATE_LAYER_MOD, SINGLETON_MOD } from './puzzles';

export const getNftUri = async (launcher_id: string, coin: Coin): Promise<string | null> => {
    const { coin_records } = await coin.get_coin_records_by_parent_ids([launcher_id]);
    const result = await coin.get_puzzle_and_solution(coin_name(String(coin_records[0].coin.amount), coin_records[0].coin.parent_coin_info, coin_records[0].coin.puzzle_hash), coin_records[0].spent_block_index);
    const outer_puzzle = hex_to_program(result.coin_solution.puzzle_reveal);
    const outer_puzzle_uncurry = uncurry(outer_puzzle);

    if (outer_puzzle_uncurry) {
        const [mod, curried_args] = outer_puzzle_uncurry;

        if (mod == SINGLETON_MOD) {
            const [_, singleton_inner_puzzle] = curried_args;

            const singleton_inner_puzzle_1 = hex_to_program(singleton_inner_puzzle);
            const singleton_inner_puzzle_1_uncurry = uncurry(singleton_inner_puzzle_1);

            if (singleton_inner_puzzle_1_uncurry) {
                const [mod, curried_args] = singleton_inner_puzzle_1_uncurry;

                if (mod == NFT_STATE_LAYER_MOD) {
                    const [_, metadata] = curried_args;

                    const metadata_program = hex_to_program(metadata);

                    for (const data of metadata_program.as_iter()) {
                        const pair = data.as_pair();

                        if (pair) {
                            const [type, value]: SExp[] = pair;

                            if (type.atom?.decode() == 'u') {
                                if (value.pair) {
                                    // URI
                                    return value.pair[0].atom.decode();
                                }
                            }
                        }
                    }
                }

            }

        }
    }

    return null;
};
