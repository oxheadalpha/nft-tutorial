import { BigNumber } from 'bignumber.js';
import * as kleur from 'kleur';

import { TezosToolkit } from '@taquito/taquito';
import { tzip12, Tzip12Module, TokenMetadata } from '@taquito/tzip12';

import { Tzip12Contract } from './type-aliases';
import { transfer } from '.';

type Address = string;
type Nat = BigNumber;

export interface BalanceRequest {
  owner: Address;
  token_id: Nat;
}

export interface BalanceResponse {
  balance: Nat;
  request: BalanceRequest;
}

export interface TransferDestination {
  to_: Address;
  token_id: Nat;
  amount: Nat;
}

export interface Transfer {
  from_: Address;
  txs: TransferDestination[];
}

export interface Fa2 {
  tzToolkit: TezosToolkit;
  at: (contractAddress: Address) => Promise<Fa2Contract>;
  useLambdaView: (lambdaView: Address) => Fa2;
}

export interface Fa2Contract {
  tzToolkit: TezosToolkit;
  useLambdaView: (lambdaView: Address) => Fa2Contract;

  queryBalance: (owner: Address, tokenId: Nat) => Promise<Nat>;
  queryBalances: (requests: BalanceRequest[]) => Promise<BalanceResponse[]>;

  hasNftToken: (owner: Address, tokenId: Nat) => Promise<boolean>;
  hasNftTokens: (requests: BalanceRequest[]) => Promise<boolean[]>;

  tokenMetadata: (tokenId: number) => Promise<TokenMetadata>;
  tokensMetadata: (tokenIds: number[]) => Promise<TokenMetadata[]>;

  transferToken: (
    from: Address,
    to: Address,
    tokenId: Nat,
    amount: Nat
  ) => Promise<void>;
  
  transferTokens: (transfers: Transfer[]) => Promise<void>;
}

const createFa2Contract = (
  tzt: TezosToolkit,
  contract: Tzip12Contract,
  lambdaView?: Address
): Fa2Contract => {
  const self: Fa2Contract = {
    tzToolkit: tzt,

    useLambdaView: (lambdaView: Address) =>
      createFa2Contract(tzt, contract, lambdaView),

    queryBalance: async (owner, tokenId) => {
      const responses = await self.queryBalances([
        { owner, token_id: tokenId }
      ]);

      return responses[0].balance;
    },

    queryBalances: async requests =>
      contract.views.balance_of(requests).read(lambdaView),

    hasNftToken: async (owner, tokenId) => {
      const responses = await self.hasNftTokens([{ owner, token_id: tokenId }]);
      return responses[0];
    },

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

    tokenMetadata: async tokenId => {
      const response = await self.tokensMetadata([tokenId]);
      return response[0];
    },

    transferToken: (from, to, tokenId, amount) =>
      self.transferTokens([
        { from_: from, txs: [{ to_: to, token_id: tokenId, amount }] }
      ]),

    transferTokens: async transfers => {
      console.log(kleur.yellow('transferring tokens...'));

      const op = await contract.methods.transfer(transfers).send();
      const hash = await op.confirmation();

      console.log(kleur.green('tokens transferred'));
    }
  };

  return self;
};

export const createFa2 = (tzt: TezosToolkit, lambdaView?: Address): Fa2 => {
  tzt.addExtension(new Tzip12Module());

  return {
    tzToolkit: tzt,

    at: async (contractAddress: Address) => {
      const contract = await tzt.contract.at(contractAddress, tzip12);
      return createFa2Contract(tzt, contract, lambdaView);
    },

    useLambdaView: (lambdaView: Address) => createFa2(tzt, lambdaView)
  };
};
