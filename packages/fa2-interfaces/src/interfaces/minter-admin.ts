import {
  ContractMethod,
  ContractProvider,
  MichelsonMap
} from '@taquito/taquito';
import { address, unit, Contract } from '../type-aliases';

export type NoMinterAdminStorage = unit;
export type NullMinterAdminStorage = unit;
export type AdminAsMinterStorage = unit;
export type MultiMinterAdminStorage = MichelsonMap<address, unit>;

export interface NoMinterAdminContract {};
export interface NullMinterAdminContract {};
export interface AdminAsMinterContract {};

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

export const NoMinterAdmin = (contract: Contract): NoMinterAdminContract => {
  return {};
}

export const NullMinterAdmin = (contract: Contract): NullMinterAdminContract => {
  return {};
}

export const AdminAsMinter = (contract: Contract): AdminAsMinterContract => {
  return {};
}

export const MultiMinterAdmin = (contract: Contract): MultiMinterAdminContract => {
  const self = {
    addMinter: (minter: address) => contract.methods.add_minter(minter),
    removeMinter: (minter: address) => contract.methods.remove_minter(minter)
  };
  return self;
}