import { BigNumber } from 'bignumber.js';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { Tzip12ContractAbstraction } from '@taquito/tzip12';
import { Tzip16ContractAbstraction } from '@taquito/tzip16';

export type Contract = ContractAbstraction<ContractProvider>;

export type ContractExt = Contract & {
  tzip12(this: Contract): Tzip12ContractAbstraction;
} & {
  tzip16(this: Contract): Tzip16ContractAbstraction;
};

export type address = string;
export type nat = BigNumber;
export type bytes = string;