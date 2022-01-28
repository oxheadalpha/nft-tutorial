import { address, nat } from './type-aliases';
import { Transfer } from './interfaces/fa2';

/**
 * A batch builder that can create transfers for the method Fa2Contract.transferTokens
 * It merges the subsequent transfers with the same source (from_ field)
 *
 * Usage example:
 * ```typescript
 * const transfers = transferBatch()
 *   .withTransfer('tzFromAccount1', 'tzToAccount1', 1, 1)
 *   .withTransfer('tzFromAccount1', 'tzToAccount2', 2, 1)
 *   .transfers;
 *
 * contract.transferTokens(transfers)
 * ```
 *
 * @param transfers a list of transfers to add more transfers to
 * (normally use the default empty list)
 *
 * @returns a batch of transfers that can be used in transferTokens
 */
export const transferBatch = (transfers: Transfer[] = []) => ({
  transfers,

  withTransfer: (from: address, to: address, tokenId: nat, amount: nat) => {
    const last = transfers[transfers.length - 1];

    const newBatch =
      !last || last.from_ !== from
        ? [
            ...transfers,
            {
              from_: from,
              txs: [{ to_: to, token_id: tokenId, amount }]
            }
          ]
        : [
            ...transfers.slice(0, -1),
            {
              from_: from,
              txs: [...last.txs, { to_: to, token_id: tokenId, amount }]
            }
          ];

    return transferBatch(newBatch);
  }
});

export type TransferBatch = ReturnType<typeof transferBatch>;
