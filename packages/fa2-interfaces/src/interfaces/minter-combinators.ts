import { Contract } from '../type-aliases';
import {
  CreateFungibleTokenParam,
  FreezableContract,
  FungibleBurnableContract,
  FungibleMintableContract,
  FungibleMintBurnParam,
  MultiFungibleBurnableContract,
  MultiFungibleMintableContract,
  MultiFungibleMintBurnParam,
  NftBurnableContract,
  NftBurnParam,
  NftMintableContract,
  NftMintParam
} from './minter';

export const BurnNft = (contract: Contract): NftBurnableContract => ({
  burn: (params: NftBurnParam[]) => contract.methods.burn(params)
});

export const MintNft = (contract: Contract): NftMintableContract => ({
  mint: (params: NftMintParam[]) => contract.methods.mint(params)
});

export const BurnFungible = (contract: Contract): FungibleBurnableContract => ({
  burn: (params: FungibleMintBurnParam[]) => contract.methods.burn(params)
});

export const MintFungible = (contract: Contract): FungibleMintableContract => ({
  mint: (params: FungibleMintBurnParam[]) => contract.methods.mint(params)
});

export const BurnMultiFungible = (
  contract: Contract
): MultiFungibleBurnableContract => ({
  burn: (params: MultiFungibleMintBurnParam[]) => contract.methods.burn(params)
});

export const MintMultiFungible = (
  contract: Contract
): MultiFungibleMintableContract => ({
  mint: (params: MultiFungibleMintBurnParam[]) => contract.methods.mint(params),
  createTokens: (params: CreateFungibleTokenParam[]) =>
    contract.methods.create_tokens(params)
});

export const Freeze = (contract: Contract): FreezableContract => ({
  mintFreeze: () => contract.methods.mint_freeze()
});
