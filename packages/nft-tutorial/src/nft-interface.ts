import {
  Tzip12Contract,
  address,
  TokenMetadataInternal,
  contractCall,
  ContractCall
} from '@oxheadalpha/fa2-interfaces';

export interface MintParam {
  owner: address;
  tokens: TokenMetadataInternal[];
}

export interface NftContract {
  mintTokens: (tokens: MintParam[]) => ContractCall;
  freezeCollection: () => ContractCall;
}

export const Nft = (contract: Tzip12Contract): NftContract => ({
  mintTokens: tokens => contractCall(contract.methods.mint(tokens)),
  freezeCollection: () => contractCall(contract.methods.mint_freeze())
});
