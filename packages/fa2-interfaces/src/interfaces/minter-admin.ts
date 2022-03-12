import { ContractMethod, ContractProvider } from '@taquito/taquito';
import { address } from '../type-aliases';
export interface MultiMinterAdminContract {
  /**
   * Only callable by the admin address
   */
  addMinter(minter: address): ContractMethod<ContractProvider>;
  /**
   * Only callable by the admin address
   */
  removeMinter(minter: address): ContractMethod<ContractProvider>;
}

