import {
  ContractMethod,
  ContractProvider
} from '@taquito/taquito';
import { TokenMetadataInternal } from './fa2';
import { address, unit, nat, Contract } from '../type-aliases';

export interface NftMintParam {
  owner: address;
  tokens: TokenMetadataInternal[];
}

export interface NftBurnParam {
  owner: address;
  tokens: nat[];
}

export interface FungibleMintBurnParam {
  owner: address;
  amount: nat;
}

export interface MultiFungibleMintBurnParam {
  owner: address;
  token_id: nat;
  amount: nat;
}

export interface CreateFungibleTokenParam {
  token_id: nat;
  metadata: TokenMetadataInternal;
}

export interface FreezableContract {
  freeze(): ContractMethod<ContractProvider>;
}

export interface NftMintableContract {
  mint(params: NftMintParam[]): ContractMethod<ContractProvider>;
}

export interface NftBurnableContract {
  burn(params: NftBurnParam[]): ContractMethod<ContractProvider>;
}

export interface FungibleMintableContract {
  mint(params: FungibleMintBurnParam[]): ContractMethod<ContractProvider>;
}

export interface FungibleBurnableContract {
  burn(params: FungibleMintBurnParam[]): ContractMethod<ContractProvider>;
}

export interface MultiFungibleMintableContract {
  createTokens(
    param: CreateFungibleTokenParam[]
  ): ContractMethod<ContractProvider>;
  mint(params: MultiFungibleMintBurnParam[]): ContractMethod<ContractProvider>;
}

export interface MultiFungibleBurnableContract {
  burn(params: MultiFungibleMintBurnParam[]): ContractMethod<ContractProvider>;
}
