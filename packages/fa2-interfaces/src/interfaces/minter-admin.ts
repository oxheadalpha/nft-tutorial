import { ContractMethod, ContractProvider } from '@taquito/taquito';
import { address } from '../type-aliases';

export interface NullMinterAdminContract {}
export interface AdminAsMinterContract {}

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

// export const NullMinterAdmin = (
//   contract: Contract
// ): NullMinterAdminContract => {
//   return {};
// };

// export const AdminAsMinter = (contract: Contract): AdminAsMinterContract => {
//   return {};
// };
