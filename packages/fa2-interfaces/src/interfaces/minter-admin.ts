import {
  ContractMethod,
  ContractProvider,
  MichelsonMap
} from '@taquito/taquito';
import { address, unit } from '../type-aliases';

export type NullMinterAdminStorage = unit;
export type AdminAsMinterStorage = unit;
export type MultiMinterAdminStorage = MichelsonMap<address, unit>;

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

