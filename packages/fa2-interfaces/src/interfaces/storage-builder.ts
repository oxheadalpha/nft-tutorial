import { MichelsonMap } from '@taquito/taquito';
import { address, unit, nat } from '../type-aliases';
import { TokenMetadataInternal } from './fa2';

export interface StorageBuilder<I, S> {
  build: (params: I) => S;
  with: <I1, S1>(sb: StorageBuilder<I1, S1>) => StorageBuilder<I & I1, S & S1>;
  transfer: <S1>(f: (s: S) => S1) => StorageBuilder<I, S1>;
}

export const storageBuilder = <I, S>(
  buildStorage: (params: I) => S
): StorageBuilder<I, S> => {
  const self: StorageBuilder<I, S> = {
    build: buildStorage,
    with: <I1, S1>(other: StorageBuilder<I1, S1>) => {
      const newBuild = (params: I & I1) => {
        const selfStorage = self.build(params);
        const otherStorage = other.build(params);
        return { ...selfStorage, ...otherStorage };
      };
      return storageBuilder(newBuild);
    },
    transfer: <S1>(f: (s: S) => S1) => {
      const newBuild = (params: I) => f(self.build(params));
      return storageBuilder(newBuild);
    }
  };

  return self;
};

export const SimpleAdmin = storageBuilder(({ owner }: { owner: string }) => ({
  admin: {
    admin: owner,
    pending_admin: undefined,
    paused: false
  }
}));

export const Assets = storageBuilder(() => ({
  assets: {
    ledger: new MichelsonMap<nat, address>(),
    operators: new MichelsonMap<[address, [address, nat]], unit>(),
    token_metadata: new MichelsonMap<nat, TokenMetadataInternal>(),
    mint_freeze: false
  }
}));

const createStorage = SimpleAdmin.with(Assets).build;
export const storage = createStorage({ owner: '' });
