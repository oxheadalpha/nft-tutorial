import { address, nat } from './type-aliases';
import { Transfer } from './fa2-interface';

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
