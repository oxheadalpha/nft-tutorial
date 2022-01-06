import * as kleur from 'kleur';

import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { tzip12, Tzip12Module, TokenMetadata } from '@taquito/tzip12';

import { Tzip12Contract, address, nat, bytes } from './type-aliases';

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
export interface Fa2 {
  tzToolkit: TezosToolkit;
  at: (contractAddress: address) => Promise<Fa2Contract>;
  useLambdaView: (lambdaView: address) => Fa2;
}

export interface Fa2Contract {
  queryBalances: (requests: BalanceRequest[]) => Promise<BalanceResponse[]>;
  hasNftTokens: (requests: BalanceRequest[]) => Promise<boolean[]>;
  tokensMetadata: (tokenIds: number[]) => Promise<TokenMetadata[]>;
  transferTokens: (transfers: Transfer[]) => Promise<void>;

  updateOperators: (
    addOperators: OperatorUpdate[],
    removeOperators: OperatorUpdate[]
  ) => Promise<void>;
}

const createFa2Contract = (
  tzt: TezosToolkit,
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

    transferTokens: async transfers => {
      console.log(kleur.yellow('transferring tokens...'));

      const op = await contract.methods.transfer(transfers).send();
      const hash = await op.confirmation();

      console.log(kleur.green('tokens transferred'));
    },

    updateOperators: async (addOperators, removeOperators) => {
      interface AddOperator {
        add_operator: OperatorUpdate;
      }
      interface RemoveOperator {
        remove_operator: OperatorUpdate;
      }

      type UpdateOperator = AddOperator | RemoveOperator;

      console.log(kleur.yellow('updating operators...'));

      const addParams: UpdateOperator[] = addOperators.map(param => {
        return { add_operator: param };
      });
      const removeParams: UpdateOperator[] = removeOperators.map(param => {
        return { remove_operator: param };
      });
      const allOperators = addParams.concat(removeParams);

      const op = await contract.methods.update_operators(allOperators).send();
      await op.confirmation();

      console.log(kleur.green('updated operators'));
    }
  };

  return self;
};

export const createFa2 = (tzt: TezosToolkit, lambdaView?: address): Fa2 => {
  tzt.addExtension(new Tzip12Module());

  return {
    tzToolkit: tzt,

    at: async (contractAddress: address) => {
      const contract = await tzt.contract.at(contractAddress, tzip12);
      return createFa2Contract(tzt, contract, lambdaView);
    },

    useLambdaView: (lambdaView: address) => createFa2(tzt, lambdaView)
  };
};
