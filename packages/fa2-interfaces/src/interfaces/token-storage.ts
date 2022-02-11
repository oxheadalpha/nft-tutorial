import { MichelsonMap } from '@taquito/taquito';
import { address, unit, nat } from '../type-aliases';
import { TokenMetadataInternal } from './fa2';
import { storageBuilder } from './storage-builder';

// const common = storageBuilder(() => ({
//   operators: new MichelsonMap<[address, [address, nat]], unit>(),
//   token_metadata: new MichelsonMap<nat, TokenMetadataInternal>()
// }));

const common = storageBuilder(
  ({ tokens }: { tokens?: TokenMetadataInternal[] }) => {
    const storage = {
      operators: new MichelsonMap<[address, [address, nat]], unit>(),
      token_metadata: new MichelsonMap<nat, TokenMetadataInternal>()
    };
    if (tokens) tokens.forEach(t => storage.token_metadata.set(t.token_id, t));
    return storage;
  }
);

const addAssetsKey = <S>(s: S) => ({ assets: s });

export const nftStorage = common
  .withF(() => ({
    ledger: new MichelsonMap<nat, address>()
  }))
  .transformResult(addAssetsKey);

export type NftStorage = ReturnType<typeof nftStorage.build>;

const fungibleTotalSupply = (p: { totalSupply?: nat }) => ({
  totalSupply: p || 0
});

export const fungibleTokenStorage = common
  .transformInput(({ token }: { token: TokenMetadataInternal }) => ({
    tokens: [token]
  }))
  .withF(() => ({
    ledger: new MichelsonMap<address, nat>()
  }))
  .withF(fungibleTotalSupply)
  .transformResult(addAssetsKey);

export type FungibleTokenStorage = ReturnType<
  typeof fungibleTokenStorage.build
>;

export const multiFungibleTokenStorage = common
  .withF(() => ({
    ledger: new MichelsonMap<[address, nat], nat>()
  }))
  .withF(fungibleTotalSupply)
  .transformResult(addAssetsKey);

export type MultiFungibleTokenStorage = ReturnType<
  typeof multiFungibleTokenStorage.build
>;

export const mintFreezeStorage = storageBuilder(() => ({
  mint_freeze: false
}));

export type MintFreeze = ReturnType<typeof mintFreezeStorage.build>;
