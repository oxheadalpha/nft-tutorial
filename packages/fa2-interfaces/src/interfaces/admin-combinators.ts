import {
  ContractAbstraction,
  ContractProvider,
  Wallet
} from '@taquito/taquito';
import { PausableContract } from '..';
import { address } from '../type-aliases';
import {
  MultiAdminContract,
  PausableSimpleAdminContract,
  SimpleAdminContract
} from './admin';

export const SimpleAdmin = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): SimpleAdminContract<TProvider> => ({
  setAdmin: (new_admin: address) => contract.methods.set_admin(new_admin),
  confirmAdmin: () => contract.methods.confirm_admin()
});

const Pausable = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): PausableContract<TProvider> => ({
  pause: (pause: boolean) => contract.methods.pause(pause)
});

export const PausableSimpleAdmin = <
  TProvider extends ContractProvider | Wallet
>(
  contract: ContractAbstraction<TProvider>
): PausableSimpleAdminContract<TProvider> => {
  return { ...SimpleAdmin(contract), ...Pausable(contract) };
};

export const MultiAdmin = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): MultiAdminContract<TProvider> => {
  return {
    ...PausableSimpleAdmin(contract),
    removeAdmin: (admin: address) => contract.methods.remove_admin(admin)
  };
};
