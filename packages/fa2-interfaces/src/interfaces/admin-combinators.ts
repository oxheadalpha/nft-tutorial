import { PausableContract } from '..';
import { address, Contract } from '../type-aliases';
import {
  MultiAdminContract,
  NonPausableSimpleAdminContract,
  SimpleAdminContract
} from './admin';

export const NonPausableSimpleAdmin = (
  contract: Contract
): NonPausableSimpleAdminContract => ({
  setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
  confirmAdmin: () => contract.methods.confirm_admin()
});

const Pausable = (contract: Contract): PausableContract => ({
  pause: (pause: boolean) => contract.methods.pause(pause)
});

export const SimpleAdmin = (contract: Contract): SimpleAdminContract => {
  return { ...NonPausableSimpleAdmin(contract), ...Pausable(contract) };
};

export const MultiAdmin = (contract: Contract): MultiAdminContract => {
  return {
    ...SimpleAdmin(contract),
    removeAdmin: (admin: address) => contract.methods.remove_admin(admin)
  };
};
