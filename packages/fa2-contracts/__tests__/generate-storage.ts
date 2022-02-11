import {
  contractStorage,
  fungibleTokenStorage,
  mintFreezeStorage,
  multiAdminStorage,
  multiFungibleTokenStorage,
  nftStorage,
  noAdmin,
  pausableSimpleAdminStorage,
  simpleAdminStorage
} from '@oxheadalpha/fa2-interfaces';
import { ContractParam } from '../src/contract-generator';

export function generateStorage(param: ContractParam) {
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
}
