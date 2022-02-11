import {
  contractStorage,
  createSimpleNftMetadata,
  fungibleTokenStorage,
  mintFreezeStorage,
  multiAdminStorage,
  multiFungibleTokenStorage,
  multiMinterAdminStorage,
  nftStorage,
  noAdminStorage,
  noMinterAdminStorage,
  pausableSimpleAdminStorage,
  simpleAdminStorage,
  StorageBuilder
} from '@oxheadalpha/fa2-interfaces';
import { ContractParam } from '../src/contract-generator';

export function generateStorage(param: ContractParam) {
  const contractS = contractStorage.withParam({
    metadata: '{ name: "Test Contract"}'
  });
  let tokenS: StorageBuilder<unknown, unknown>;
  switch (param.implementation) {
    case 'USE_NFT_TOKEN':
      tokenS = contractS.with(nftStorage).withParam({});
      break;
    case 'USE_FUNGIBLE_TOKEN':
      tokenS = contractS
        .with(fungibleTokenStorage)
        .withParam({ token: createSimpleNftMetadata(0, 'test') });
      break;
    case 'USE_MULTI_FUNGIBLE_TOKEN':
      tokenS = contractS.with(multiFungibleTokenStorage).withParam({});
      break;
  }
  const freezableS = param.minter.has('CAN_FREEZE')
    ? tokenS.with(mintFreezeStorage).withParam({})
    : tokenS;

  let adminS: StorageBuilder<unknown, unknown>;
  switch (param.admin) {
    case 'USE_NO_ADMIN':
      adminS = freezableS.with(noAdminStorage).withParam({});
      break;
    case 'USE_SIMPLE_ADMIN':
      adminS = freezableS
        .with(simpleAdminStorage)
        .withParam({ owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
    case 'USE_PAUSABLE_SIMPLE_ADMIN':
      adminS = freezableS
        .with(pausableSimpleAdminStorage)
        .withParam({ owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
    case 'USE_MULTI_ADMIN':
      adminS = freezableS
        .with(multiAdminStorage)
        .withParam({ owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
  }

  let minterAdminS: StorageBuilder<unknown, unknown>;
  switch (param.minterAdmin) {
    case 'USE_ADMIN_AS_MINTER':
    case 'USE_NULL_MINTER_ADMIN':
      minterAdminS = adminS.with(noMinterAdminStorage).withParam({});
      break;
    case 'USE_MULTI_MINTER_ADMIN':
      minterAdminS = adminS
        .with(multiMinterAdminStorage)
        .withParam({ minter: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
  }
  return minterAdminS.build(undefined);
}
