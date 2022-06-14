import {
  ContractAbstraction,
  ContractProvider,
  Wallet
} from '@taquito/taquito';
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

export const BurnNft = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): NftBurnableContract<TProvider> => ({
  burn: (params: NftBurnParam[]) => contract.methods.burn(params)
});

export const MintNft = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): NftMintableContract<TProvider> => ({
  mint: (params: NftMintParam[]) => contract.methods.mint(params)
});

export const BurnFungible = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): FungibleBurnableContract<TProvider> => ({
  burn: (params: FungibleMintBurnParam[]) => contract.methods.burn(params)
});

export const MintFungible = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): FungibleMintableContract<TProvider> => ({
  mint: (params: FungibleMintBurnParam[]) => contract.methods.mint(params)
});

export const BurnMultiFungible = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): MultiFungibleBurnableContract<TProvider> => ({
  burn: (params: MultiFungibleMintBurnParam[]) => contract.methods.burn(params)
});

export const MintMultiFungible = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): MultiFungibleMintableContract<TProvider> => ({
  mint: (params: MultiFungibleMintBurnParam[]) => contract.methods.mint(params),
  createTokens: (params: CreateFungibleTokenParam[]) =>
    contract.methods.create_tokens(params)
});

export const Freeze = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): FreezableContract<TProvider> => ({
  mintFreeze: () => contract.methods.mint_freeze()
});
