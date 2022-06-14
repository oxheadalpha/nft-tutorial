import { ContractMethod, ContractProvider, Wallet } from '@taquito/taquito';
import { address } from '../type-aliases';
export interface MultiMinterAdminContract<
  TProvider extends ContractProvider | Wallet
> {
  /**
   * Only callable by the admin address
   */
  addMinter(minter: address): ContractMethod<TProvider>;
  /**
   * Only callable by the admin address
   */
  removeMinter(minter: address): ContractMethod<TProvider>;
}
