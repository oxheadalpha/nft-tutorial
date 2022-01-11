import {
  ContractMethod,
  ContractProvider
} from '@taquito/taquito';

import {
  Tzip12Contract,
  address,
  TokenMetadataInternal
} from '@oxheadalpha/fa2-interfaces';

export interface MintParam {
  owner: address;
  tokens: TokenMetadataInternal[];
}

export interface NftContract {
  mintTokens: (tokens: MintParam[]) => ContractMethod<ContractProvider>;
  freezeCollection: () => ContractMethod<ContractProvider>;
}

export const Nft = (contract: Tzip12Contract): NftContract => ({
  mintTokens: tokens => contract.methods.mint(tokens),
  freezeCollection: () => contract.methods.mint_freeze()
});
