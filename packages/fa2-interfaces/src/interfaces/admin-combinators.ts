import { PausableContract } from '..';
import { address, Contract } from '../type-aliases';
import {
  MultiAdminContract,
  PausableSimpleAdminContract,
  SimpleAdminContract
} from './admin';

export const SimpleAdmin = (contract: Contract): SimpleAdminContract => ({
  setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
  confirmAdmin: () => contract.methods.confirm_admin()
});

const Pausable = (contract: Contract): PausableContract => ({
  pause: (pause: boolean) => contract.methods.pause(pause)
});

export const PausableSimpleAdmin = (
  contract: Contract
): PausableSimpleAdminContract => {
  return { ...SimpleAdmin(contract), ...Pausable(contract) };
};

export const MultiAdmin = (contract: Contract): MultiAdminContract => {
  return {
    ...PausableSimpleAdmin(contract),
    removeAdmin: (admin: address) => contract.methods.remove_admin(admin)
  };
};
