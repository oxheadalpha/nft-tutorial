import * as kleur from 'kleur';

import { Contract, MichelsonMap } from '@taquito/taquito';
import { TokenMetadata } from '@taquito/tzip12';

import { Tzip12Contract, address, nat, bytes } from './type-aliases';
import { contractCall, ContractCall } from './tezos-api';

export interface BalanceRequest {
  owner: address;
  token_id: nat;
}

export interface BalanceResponse {
  balance: nat;
  request: BalanceRequest;
}

export interface TransferDestination {
  to_: address;
  token_id: nat;
  amount: nat;
}

export interface Transfer {
  from_: address;
  txs: TransferDestination[];
}

export interface OperatorUpdate {
  owner: address;
  operator: address;
  token_id: nat;
}

// this is how token metadata stored withing the contract internally
export interface TokenMetadataInternal {
  token_id: nat;
  token_info: MichelsonMap<string, bytes>;
}

export interface Fa2Contract {
  queryBalances: (requests: BalanceRequest[]) => Promise<BalanceResponse[]>;
  hasNftTokens: (requests: BalanceRequest[]) => Promise<boolean[]>;
  tokensMetadata: (tokenIds: number[]) => Promise<TokenMetadata[]>;
  transferTokens: (transfers: Transfer[]) => ContractCall;

  updateOperators: (
    addOperators: OperatorUpdate[],
    removeOperators: OperatorUpdate[]
  ) => ContractCall;
}

export const Fa2 = (
  contract: Tzip12Contract,
  lambdaView?: address
): Fa2Contract => {
  const self: Fa2Contract = {
    queryBalances: async requests =>
      contract.views.balance_of(requests).read(lambdaView),

    hasNftTokens: async requests => {
      const responses = await self.queryBalances(requests);

      const results = responses.map(r => {
        if (r.balance.eq(1)) return true;
        else if (r.balance.eq(0)) return false;
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

    transferTokens: transfers =>
      contractCall(contract.methods.transfer(transfers)),

    updateOperators: (addOperators, removeOperators) => {
      interface AddOperator {
        add_operator: OperatorUpdate;
      }
      interface RemoveOperator {
        remove_operator: OperatorUpdate;
      }

      type UpdateOperator = AddOperator | RemoveOperator;

      const addParams: UpdateOperator[] = addOperators.map(param => {
        return { add_operator: param };
      });
      const removeParams: UpdateOperator[] = removeOperators.map(param => {
        return { remove_operator: param };
      });
      const allOperators = addParams.concat(removeParams);

      return contractCall(contract.methods.update_operators(allOperators));
    }
  };

  return self;
};
