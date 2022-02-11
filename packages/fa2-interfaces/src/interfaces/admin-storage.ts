import { MichelsonMap } from '@taquito/taquito';
import { storageBuilder } from './storage-builder';
import { address, unit } from '../type-aliases';

const simple = ({ owner }: { owner: address }) => ({
  admin: owner,
  pending_admin: undefined
});

const multi = ({ owner }: { owner: address }) => ({
  admins: new Set(owner),
  pending_admins: new MichelsonMap<address, unit>()
});

const pausable = ({ paused }: { paused?: boolean }) => ({
  paused: paused || false
});

const addAdminKey = <S>(s: S) => ({ admin: s });

export const simpleAdminStorage =
  storageBuilder(simple).transformResult(addAdminKey);
export type SimpleAdminStorage = ReturnType<typeof simpleAdminStorage.build>;

export const pausableSimpleAdminStorage = storageBuilder(simple)
  .withF(pausable)
  .transformResult(addAdminKey);

export type PausableSimpleAdminStorage = ReturnType<
  typeof pausableSimpleAdminStorage.build
>;

export const multiAdminStorage = storageBuilder(multi)
  .withF(pausable)
  .transformResult(addAdminKey);

export type MultiAdminStorage = ReturnType<typeof multiAdminStorage.build>;

export const noAdminStorage = storageBuilder(() => null).transformResult(
  addAdminKey
);

export type NoAdminStorage = ReturnType<typeof noAdminStorage.build>;
