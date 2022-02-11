import { MichelsonMap } from '@taquito/taquito';
import { storageBuilder } from '..';
import { unit, address } from '../type-aliases';

const addMinterAdminKey = <S>(s: S) => ({ minter_admin: s });

const multiMinterAdmin = ({ minter }: { minter?: address }) => {
  const minters = new MichelsonMap<address, unit>();
  if (minter) minters.set(minter, null);
  return minters;
};

export const noMinterAdminStorage = storageBuilder(() => null).transformResult(
  addMinterAdminKey
);

export type NoMinterAdminStorage = ReturnType<
  typeof noMinterAdminStorage.build
>;

export const multiMinterAdminStorage =
  storageBuilder(multiMinterAdmin).transformResult(addMinterAdminKey);

export type MultiMinterAdminStorage = ReturnType<
  typeof multiMinterAdminStorage.build
>;
