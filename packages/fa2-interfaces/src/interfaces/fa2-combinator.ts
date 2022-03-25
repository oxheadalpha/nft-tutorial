import { BigNumber } from 'bignumber.js';
import { Tzip12Contract, address } from '../type-aliases';
import { Fa2Contract } from './fa2';

/**
 * FA2 contract API extension
 *
 * Usage example:
 * ```typescript
 * const fa2Contract =
 *   (await tezosApi(tz).at(contractAddress)).with(Fa2);
 * await fa2Contract.transfer(...);
 * ```
 */
export const Fa2 = (contract: Tzip12Contract): Fa2Contract => {
  const self: Fa2Contract = {
    queryBalances: async requests => contract.views.balance_of(requests).read(),

    hasNftTokens: async requests => {
      const responses = await self.queryBalances(requests);

      const one = new BigNumber(1);
      const zero = new BigNumber(0);
      const results = responses.map(r => {
        if (one.eq(r.balance)) return true;
        else if (zero.eq(r.balance)) return false;
        else throw new Error(`Invalid NFT balance ${r.balance}`);
      });

      return results;
    },

    tokensMetadata: async tokenIds => {
      const requests = tokenIds.map(id =>
        contract.tzip12().getTokenMetadata(id)
      );
      return Promise.all(requests);
    },

    transferTokens: transfers => contract.methods.transfer(transfers),

    updateOperators: updates => contract.methods.update_operators(updates)
  };

  return self;
};
