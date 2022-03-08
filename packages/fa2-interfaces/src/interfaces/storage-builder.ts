import { MichelsonMap } from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';
import { bytes } from '../type-aliases';

/**
 * Storage builder is a wrapper around function `(params: I) => S`
 * I - input parameters
 * S - storage that can be used in Taquito.
 *
 * StorageBuilder wrapper allows to compose function like the above to form
 * more complicated functions.
 */
export interface StorageBuilder<I, S> {
  /**
   * Run the wrapped function and return initial storage
   */
  build: (params: I) => S;

  /**
   * Compose `this` Storage builder with other one represented by a function `f`.
   * @return new builder that requires both input parameters for `this` and
   * other and will return an initial storage that will have fields of `this`
   * and other.
   */
  withF: <I1, S1>(f: (p: I1) => S1) => StorageBuilder<I & I1, S & S1>;

  /**
   * Compose `this` Storage builder with `other`, returning a new
   * builder that requires both input parameters for  `this` and
   * `other` and will return an initial storage that will have
   * fields of `this` and `other`.
   */
  with: <I1, S1>(
    other: StorageBuilder<I1, S1>
  ) => StorageBuilder<I & I1, S & S1>;

  /**
   * @return a new builder that will create storage S1 by applying
   * function f to storage S
   */
  transformResult: <S1>(f: (s: S) => S1) => StorageBuilder<I, S1>;

  /**
   * @return a new builder that will require input parameters I1
   * by using builder that requires parameters I and applying
   * function f to the input I1.
   */
  transformInput: <I1>(f: (p: I1) => I) => StorageBuilder<I1, S>;
  
  /**
   * @return a new builder that applies provide input parameter and does not
   * require any further input
   */
  withParams: (params: I) => StorageBuilder<unknown, S>;
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
    withParams: (params: I) => {
      const newBuild = () => self.build(params);
      return storageBuilder(newBuild);
    }
  };

  return self;
};

/**
 * Storage builder that requires just one parameter metadata.
 * It is usually used as a starting point.
 */
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
