import { address, Contract } from '../type-aliases';
import {
  MultiAdminContract,
  NonPausableSimpleAdminContract,
  SimpleAdminContract
} from './admin';

export const SimpleAdmin = (contract: Contract): SimpleAdminContract => ({
  setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
  confirmAdmin: () => contract.methods.confirm_admin(),
  pause: (pause: boolean) => contract.methods.pause(pause)
});

export const NonPausableSimpleAdmin = (
  contract: Contract
): NonPausableSimpleAdminContract => ({
  setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
  confirmAdmin: () => contract.methods.confirm_admin()
});

export const MultiAdmin = (contract: Contract): MultiAdminContract => ({
  setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
  confirmAdmin: () => contract.methods.confirm_admin(),
  removeAdmin: (admin: address) => contract.methods.remove_admin(admin),
  pause: (pause: boolean) => contract.methods.pause(pause)
});
