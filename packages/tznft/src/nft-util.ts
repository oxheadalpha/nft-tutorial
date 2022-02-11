import {
  contractStorage,
  mintFreezeStorage,
  nftStorage,
  pausableSimpleAdminStorage
} from '@oxheadalpha/fa2-interfaces';

import { address, TokenMetadataInternal } from '@oxheadalpha/fa2-interfaces';

export interface MintParam {
  owner: address;
  tokens: TokenMetadataInternal[];
}

export const createNftStorage = (owner: string, metadata: string) =>
  contractStorage
    .with(pausableSimpleAdminStorage)
    .with(nftStorage)
    .with(mintFreezeStorage)
    .build({ owner, metadata });
