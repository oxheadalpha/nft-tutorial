import { MichelsonMap } from '@taquito/taquito';
import { address, unit, nat } from '../type-aliases';
import { TokenMetadataInternal } from './fa2';

type OperatorStorage = MichelsonMap<[address, [address, nat]], unit>;
type TokenMetadataStorage = MichelsonMap<nat, TokenMetadataInternal>;

export type NftStorage = {
  token_metadata: TokenMetadataStorage;
  ledger: MichelsonMap<nat, address>;
  operators: OperatorStorage;
};

export type FungibleTokenStorage = {
  ledger: MichelsonMap<address, nat>;
  operators: OperatorStorage;
  token_metadata: TokenMetadataStorage;
  total_supply: nat;
};

export type MultiFungibleTokenStorage = {
  ledger : MichelsonMap<[address, nat], nat>;
  operators : OperatorStorage;
  total_supply : MichelsonMap<nat, nat>;
  token_metadata : TokenMetadataStorage;
};
