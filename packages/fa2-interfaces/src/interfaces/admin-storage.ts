import { MichelsonMap } from '@taquito/taquito';
import { storageBuilder } from './storage-builder';
import { address, unit } from '../type-aliases';

const Simple = storageBuilder(({ owner }: { owner: string }) => ({
  admin: owner,
  pending_admin: undefined
}));

const Multi = storageBuilder(({ owner }: { owner: string }) => ({
  admins: new Set(owner),
  pending_admins: new MichelsonMap<address, unit>()
}));

const Pausable = storageBuilder(() => ({
  paused: false
}));

const addAdminKey = <S>(s: S) => ({ admin: s });

export const SimpleAmdin = Simple.transform(addAdminKey);
export const PausableSimpleAdmin = Simple.with(Pausable).transform(addAdminKey);
export const MultiAdminStorage = Multi.with(Pausable).transform(addAdminKey);
