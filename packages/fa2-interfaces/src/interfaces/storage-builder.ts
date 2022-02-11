import { MichelsonMap } from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';
import { bytes } from '../type-aliases';

export interface StorageBuilder<I, S> {
  build: (params: I) => S;
  withF: <I1, S1>(f: (p: I1) => S1) => StorageBuilder<I & I1, S & S1>;
  with: <I1, S1>(sb: StorageBuilder<I1, S1>) => StorageBuilder<I & I1, S & S1>;
  transformResult: <S1>(f: (s: S) => S1) => StorageBuilder<I, S1>;
  transformInput: <I1>(f: (p: I1) => I) => StorageBuilder<I1, S>;
  withParam: (p: I) => StorageBuilder<unknown, S>;
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
    withF: f => self.with(storageBuilder(f)),
    transformResult: <S1>(f: (s: S) => S1) => {
      const newBuild = (params: I) => f(self.build(params));
      return storageBuilder(newBuild);
    },
    transformInput: <I1>(f: (p: I1) => I) => {
      const newBuild = (params: I1) => self.build(f(params));
      return storageBuilder(newBuild);
    },
    withParam: (p: I) => {
      const newBuild = () => self.build(p);
      return storageBuilder(newBuild);
    }
  };

  return self;
};

export const contractStorage = storageBuilder(
  ({ metadata }: { metadata: string }) => {
    const metaMap = new MichelsonMap<string, bytes>();
    metaMap.set('', char2Bytes('tezos-storage:content'));
    metaMap.set('content', char2Bytes(metadata));

    return {
      metadata: metaMap
    };
  }
);
