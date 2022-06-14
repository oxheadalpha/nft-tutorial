import { ContractMethod, ContractProvider, Wallet } from '@taquito/taquito';
import { address } from '../type-aliases';

export interface NoAdminContract {}

/**
 * Only a single address can be an admin of the contract.
 */
export interface SimpleAdminContract<
  TProvider extends ContractProvider | Wallet
> {
  /**
   * Set a new pending admin. Only callable by the current admin.
   */
  setAdmin(new_admin: address): ContractMethod<TProvider>;

  /**
   * Replace current admin with the pending admin. Only callable by the
   * pending admin address.
   */
  confirmAdmin(): ContractMethod<TProvider>;
}

export interface PausableContract<TProvider extends ContractProvider | Wallet> {
  /**
   * Pause/unpause the contract. Only callable by the current admin address.
   * If a contract is paused, all non-admin entry points will fail.
   */
  pause(pause: boolean): ContractMethod<TProvider>;
}

/**
 * Only a single address can be an admin of the contract.
 * Contract can be paused by the admin.
 */
export type PausableSimpleAdminContract<
  TProvider extends ContractProvider | Wallet
> = SimpleAdminContract<TProvider> & PausableContract<TProvider>;

/**
 * Multiple addresses can be contract admins.
 * Contract can be paused by an admin.
 */
export type MultiAdminContract<TProvider extends ContractProvider | Wallet> =
  PausableSimpleAdminContract<TProvider> & {
    /**
     * Removes one of the existing admins. Only callable by an admin address.
     */
    removeAdmin(admin: address): ContractMethod<TProvider>;
  };
