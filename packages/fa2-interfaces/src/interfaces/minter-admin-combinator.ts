import { address, Contract } from '../type-aliases';
import { MultiMinterAdminContract } from './minter-admin';

export const MultiMinterAdmin = (
  contract: Contract
): MultiMinterAdminContract => {
  const self = {
    addMinter: (minter: address) => contract.methods.add_minter(minter),
    removeMinter: (minter: address) => contract.methods.remove_minter(minter)
  };
  return self;
};