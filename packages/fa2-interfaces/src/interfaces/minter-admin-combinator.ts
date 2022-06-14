import {
  ContractAbstraction,
  ContractProvider,
  Wallet
} from '@taquito/taquito';
import { address } from '../type-aliases';
import { MultiMinterAdminContract } from './minter-admin';

export const MultiMinterAdmin = <TProvider extends ContractProvider | Wallet>(
  contract: ContractAbstraction<TProvider>
): MultiMinterAdminContract<TProvider> => {
  const self = {
    addMinter: (minter: address) => contract.methods.add_minter(minter),
    removeMinter: (minter: address) => contract.methods.remove_minter(minter)
  };
  return self;
};
