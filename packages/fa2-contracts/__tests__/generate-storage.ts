import {
  contractStorage,
  createSimpleNftMetadata,
  fungibleTokenStorage,
  mintFreezeStorage,
  multiAdminStorage,
  multiFungibleTokenStorage,
  multiMinterAdminStorage,
  nftStorage,
  pausableSimpleAdminStorage,
  simpleAdminStorage,
  StorageBuilder
} from '@oxheadalpha/fa2-interfaces';
import { ContractParam } from '../src/contract-generator';

export function generateStorage(param: ContractParam) {
  const contractS = contractStorage.withParams({
    metadata: '{ name: "Test Contract"}'
  });
  let tokenS: StorageBuilder<unknown, unknown>;
  switch (param.implementation) {
    case 'USE_NFT_TOKEN':
      tokenS = contractS.with(nftStorage).withParams({});
      break;
    case 'USE_FUNGIBLE_TOKEN':
      tokenS = contractS
        .with(fungibleTokenStorage)
        .withParams({ token: createSimpleNftMetadata(0, 'test') });
      break;
    case 'USE_MULTI_FUNGIBLE_TOKEN':
      tokenS = contractS.with(multiFungibleTokenStorage).withParams({});
      break;
  }
  const freezableS = param.minter.has('CAN_FREEZE')
    ? tokenS.with(mintFreezeStorage).withParams({})
    : tokenS;

  let adminS: StorageBuilder<unknown, unknown>;
  switch (param.admin) {
    case 'USE_NO_ADMIN':
      adminS = freezableS;
      break;
    case 'USE_SIMPLE_ADMIN':
      adminS = freezableS
        .with(simpleAdminStorage)
        .withParams({ owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
    case 'USE_PAUSABLE_SIMPLE_ADMIN':
      adminS = freezableS
        .with(pausableSimpleAdminStorage)
        .withParams({ owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
    case 'USE_MULTI_ADMIN':
      adminS = freezableS
        .with(multiAdminStorage)
        .withParams({ owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
  }

  let minterAdminS: StorageBuilder<unknown, unknown>;
  switch (param.minterAdmin) {
    case 'USE_ADMIN_AS_MINTER':
    case 'USE_NULL_MINTER_ADMIN':
      minterAdminS = adminS;
      break;
    case 'USE_MULTI_MINTER_ADMIN':
      minterAdminS = adminS
        .with(multiMinterAdminStorage)
        .withParams({ minter: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU' });
      break;
  }
  return minterAdminS.build(undefined);
}
