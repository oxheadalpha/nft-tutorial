import {
  ContractMethod,
  ContractProvider,
  MichelsonMap
} from '@taquito/taquito';
import { address, unit, Contract } from '../type-aliases';

export type NoAdminStorage = unit;

export interface NoAdminContract {}

export type NonPausableSimpleAdminStorage = {
  admin: address;
  pending_admin: address | undefined;
};

/**
 * Only a single address can be an admin of the contract.
 */
export interface NonPausableSimpleAdminContract {
  /**
   * Set a new pending admin. Only callable by the current admin.
   */
  setAdmin(new_admin: address): ContractMethod<ContractProvider>;

  /**
   * Replace current admin with the pending admin. Only callable by the
   * pending admin address.
   */
  confirmAdmin(): ContractMethod<ContractProvider>;
}

export type SimpleAdminStorage =
  | NonPausableSimpleAdminStorage
  | {
      paused: boolean;
    };
/**
 * Only a single address can be an admin of the contract.
 * Contract can be paused by the admin.
 */
export type SimpleAdminContract =
  | NonPausableSimpleAdminContract
  | {
      /**
       * Pause/unpause the contract. Only callable by the current admin address.
       * If a contract is paused, all non-admin entry points will fail.
       */
      pause(pause: boolean): ContractMethod<ContractProvider>;
    };

export type MultiAdminStorage = {
  admins: Set<address>;
  pending_admins: MichelsonMap<address, unit>;
  paused: boolean;
};

/**
 * Multiple addresses can be contract admins.
 * Contract can be paused by an admin.
 */
export type MultiAdminContract =
  | SimpleAdminContract
  | {
      /**
       * Removes one of the existing admins. Only callable by an admin address.
       */
      removeAdmin(admin: address): ContractMethod<ContractProvider>;
    };

export const NoAdmin = (contract: Contract): NoAdminContract => {
  return {};
};

export const SimpleAdmin = (contract: Contract): SimpleAdminContract => {
  const self = {
    setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
    confirmAdmin: () => contract.methods.confirm_admin(),
    pause: (pause: boolean) => contract.methods.pause(pause)
  };
  return self;
};

export const NonPausableSimpleAdmin = (
  contract: Contract
): NonPausableSimpleAdminContract => {
  const self = {
    setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
    confirmAdmin: () => contract.methods.confirm_admin()
  };
  return self;
};

export const MultiAdmin = (contract: Contract): MultiAdminContract => {
  const self = {
    setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
    confirmAdmin: () => contract.methods.confirm_admin(),
    removeAdmin: (admin: address) => contract.methods.remove_admin(admin),
    pause: (pause: boolean) => contract.methods.pause(pause)
  }
  return self;
}