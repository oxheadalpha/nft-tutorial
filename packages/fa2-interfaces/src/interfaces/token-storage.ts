import { MichelsonMap } from '@taquito/taquito';
import { address, unit, nat } from '../type-aliases';
import { TokenMetadataInternal } from './fa2';
import { storageBuilder } from './storage-builder';

const common = storageBuilder(() => ({
  operators: new MichelsonMap<[address, [address, nat]], unit>(),
  token_metadata: new MichelsonMap<nat, TokenMetadataInternal>()
}));

const totalSupply = (p: { totalSupply?: nat }) => ({
  totalSupply: p || 0
});

const addAssetsKey = <S>(s: S) => ({ assets: s });

export const nftStorage = common
  .withF(() => ({
    ledger: new MichelsonMap<nat, address>()
  }))
  .transform(addAssetsKey);

export type NftStorage = ReturnType<typeof nftStorage.build>;

export const fungibleTokenStorage = common
  .withF(() => ({
    ledger: new MichelsonMap<address, nat>()
  }))
  .withF(totalSupply)
  .transform(addAssetsKey);

export type FungibleTokenStorage = ReturnType<
  typeof fungibleTokenStorage.build
>;

export const multiFungibleTokenStorage = common
  .withF(() => ({
    ledger: new MichelsonMap<[address, nat], nat>()
  }))
  .withF(totalSupply)
  .transform(addAssetsKey);

export type MultiFungibleTokenStorage = ReturnType<
  typeof multiFungibleTokenStorage.build
>;

export const mintFreezeStorage = storageBuilder(() => ({
  mint_freeze: false
}));

export type MintFreeze = ReturnType<typeof mintFreezeStorage.build>;
