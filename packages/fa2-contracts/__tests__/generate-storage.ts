import {
  contractStorage,
<<<<<<< HEAD
  createSimpleNftMetadata,
=======
>>>>>>> 671670ae632a7bfbff631985b8170ad2a3357cbc
  fungibleTokenStorage,
  mintFreezeStorage,
  multiAdminStorage,
  multiFungibleTokenStorage,
<<<<<<< HEAD
  multiMinterAdminStorage,
  nftStorage,
  noAdminStorage,
  noMinterAdminStorage,
  pausableSimpleAdminStorage,
  simpleAdminStorage,
  StorageBuilder
=======
  nftStorage,
  noAdmin,
  pausableSimpleAdminStorage,
  simpleAdminStorage
>>>>>>> 671670ae632a7bfbff631985b8170ad2a3357cbc
} from '@oxheadalpha/fa2-interfaces';
import { ContractParam } from '../src/contract-generator';

export function generateStorage(param: ContractParam) {
<<<<<<< HEAD
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
=======
  const contractS = contractStorage;
  switch (param.implementation) {
    case 'USE_NFT_TOKEN':
      let tokenS = contractS.with(nftStorage);
      break;
    case 'USE_FUNGIBLE_TOKEN':
      tokenS = contractS.with(fungibleTokenStorage);
      break;
    case 'USE_MULTI_FUNGIBLE_TOKEN':
      tokenS = contractS.with(multiFungibleTokenStorage);
      break;
  }
  const freezableS = param.minter.has('CAN_FREEZE')
    ? tokenS.with(mintFreezeStorage)
    : tokenS;

  let adminS;
  switch(param.admin) {
    case 'USE_NO_ADMIN':
      adminS = freezableS.with(noAdmin);
      break;
    case 'USE_SIMPLE_ADMIN':
      adminS = freezableS.with(simpleAdminStorage);
      break;
    case 'USE_PAUSABLE_SIMPLE_ADMIN':
      adminS = freezableS.with(pausableSimpleAdminStorage);
      break;
    case 'USE_MULTI_ADMIN':
      adminS = freezableS.with(multiAdminStorage);
      break;
  }
  return adminS;
>>>>>>> 671670ae632a7bfbff631985b8170ad2a3357cbc
}
