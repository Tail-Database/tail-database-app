import { OPERATOR_LOOKUP, SExp, run_program } from 'clvm';
import { go, setPrintFunction } from 'clvm_tools';
import { Coin, coin_name, hash_program, hex_to_program, match_cat_puzzle, COIN_CREATE_CONDITION, MAGIC_SPEND } from '@tail-database/tail-database-client';

export const getTailReveal = async (coin_id: string, rpc: Coin): Promise<[string, string, string]> => {
    let current_coin = coin_id;

    while (true) {
        const coin = await rpc.get_coin_record_by_name(current_coin);

        if (!coin.success || !coin.coin_record) {
            throw new Error(`Could not find coin id ${current_coin}`);
        }

        const parent_coin_info = coin.coin_record.coin.parent_coin_info;
        const parent = await rpc.get_puzzle_and_solution(parent_coin_info, coin.coin_record.confirmed_block_index);

        if (!parent.coin_solution) {
            throw new Error(`Could not find parent spend ${parent_coin_info} at height ${coin.coin_record.confirmed_block_index}`);
        }

        const puzzle = hex_to_program(parent.coin_solution.puzzle_reveal);
        const match = match_cat_puzzle(puzzle);

        // First parent that is not a CAT
        if (!match) {
            const children = await rpc.get_coin_records_by_parent_ids([parent_coin_info]);

            for (const child of children.coin_records) {
                const child_coin_name = coin_name(String(child.coin.amount), child.coin.parent_coin_info, child.coin.puzzle_hash);
                const child_reveal = await rpc.get_puzzle_and_solution(child_coin_name, child.spent_block_index);

                if (!child_reveal.success) {
                    // This coin hasn't been spent but there may be another child that has
                    continue;
                }

                const puzzle = hex_to_program(child_reveal.coin_solution.puzzle_reveal);
                const match = match_cat_puzzle(puzzle);

                // First CAT
                if (match) {
                    const [,,inner_puzzle] = match;
                    const outer_solution = hex_to_program(child_reveal.coin_solution.solution);
                    const inner_solution = (outer_solution.as_iter().next().value as SExp);
                    const inner_puzzle_program = hex_to_program(inner_puzzle);

                    const [, result] = run_program(
                        inner_puzzle_program,
                        inner_solution,
                        OPERATOR_LOOKUP,
                    );

                    for (const data of result.as_iter()) {
                        const opcode = (data as SExp).first();

                        if (opcode.as_int() == COIN_CREATE_CONDITION) {
                            const puzzle_hash = data.rest().first();

                            if (puzzle_hash.equal_to(SExp.to([]))) {
                                const amount = data.rest().rest().first();

                                if (amount.as_int() == MAGIC_SPEND) {
                                    const tail: SExp = data.rest().rest().rest().first();
                                    const hashed_tail_reveal = hash_program(tail);
                                    const tail_reveal: string = await new Promise(resolve => {
                                        setPrintFunction(disassembled_clvm => resolve(disassembled_clvm));
                                        go('opd', tail.toString());
                                      });

                                    return [child_coin_name.slice(2), hashed_tail_reveal, tail_reveal];
                                }
                            }
                        }
                    }
                }
            }
        }

        current_coin = parent_coin_info;
    }
};
