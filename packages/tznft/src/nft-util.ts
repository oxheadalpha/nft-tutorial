import {
  contractStorage,
  mintFreezeStorage,
  nftStorage,
  pausableSimpleAdminStorage,
  noMinterAdminStorage
} from '@oxheadalpha/fa2-interfaces';

export const createNftStorage = (owner: string, metadata: string) =>
  contractStorage
    .with(pausableSimpleAdminStorage)
    .with(nftStorage)
    .with(mintFreezeStorage)
    .with(noMinterAdminStorage)
    .build({ owner, metadata });
