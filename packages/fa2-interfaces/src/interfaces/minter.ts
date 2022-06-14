import { ContractMethod, ContractProvider, Wallet } from '@taquito/taquito';
import { TokenMetadataInternal } from './fa2';
import { address, nat } from '../type-aliases';

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

export interface FreezableContract<
  TProvider extends ContractProvider | Wallet
> {
  mintFreeze(): ContractMethod<TProvider>;
}

export interface NftMintableContract<
  TProvider extends ContractProvider | Wallet
> {
  mint(params: NftMintParam[]): ContractMethod<TProvider>;
}

export interface NftBurnableContract<
  TProvider extends ContractProvider | Wallet
> {
  burn(params: NftBurnParam[]): ContractMethod<TProvider>;
}

export interface FungibleMintableContract<
  TProvider extends ContractProvider | Wallet
> {
  mint(params: FungibleMintBurnParam[]): ContractMethod<TProvider>;
}

export interface FungibleBurnableContract<
  TProvider extends ContractProvider | Wallet
> {
  burn(params: FungibleMintBurnParam[]): ContractMethod<TProvider>;
}

export interface MultiFungibleMintableContract<
  TProvider extends ContractProvider | Wallet
> {
  createTokens(param: CreateFungibleTokenParam[]): ContractMethod<TProvider>;
  mint(params: MultiFungibleMintBurnParam[]): ContractMethod<TProvider>;
}

export interface MultiFungibleBurnableContract<
  TProvider extends ContractProvider | Wallet
> {
  burn(params: MultiFungibleMintBurnParam[]): ContractMethod<TProvider>;
}
