import {
  ContractMethod,
  ContractProvider,
  MichelsonMap
} from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';

import {
  Tzip12Contract,
  address,
  nat,
  TokenMetadataInternal,
  bytes
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

export function createNftStorage(owner: string, metaJson: string) {
  const assets = {
    ledger: new MichelsonMap(),
    operators: new MichelsonMap(),
    token_metadata: new MichelsonMap()
  };
  const admin = {
    admin: owner,
    pending_admin: undefined,
    paused: false
  };
  const metadata = new MichelsonMap<string, bytes>();
  metadata.set('', char2Bytes('tezos-storage:content'));
  metadata.set('content', char2Bytes(metaJson));

  return {
    assets,
    admin,
    metadata,
    mint_freeze: false
  };
}

export function createTokenMetadata(
  tokenId: nat,
  tokenMetadataUri: string
): TokenMetadataInternal {
  const m: TokenMetadataInternal = {
    token_id: tokenId,
    token_info: new MichelsonMap()
  };
  m.token_info.set('', char2Bytes(tokenMetadataUri));
  return m;
}
