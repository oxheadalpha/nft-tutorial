import { BigNumber } from 'bignumber.js';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { Tzip12ContractAbstraction } from '@taquito/tzip12';
import { Tzip16ContractAbstraction } from '@taquito/tzip16';
import { Wallet } from '@taquito/taquito';

/**
 * Taquito contract proxy with TZIP-12 and TZIP extension
 */
export type ContractExt<TProvider extends ContractProvider | Wallet> =
  ContractAbstraction<TProvider> & {
    tzip12(this: ContractAbstraction<TProvider>): Tzip12ContractAbstraction;
  } & {
    tzip16(this: ContractAbstraction<TProvider>): Tzip16ContractAbstraction;
  };

/**
 * Taquito contract proxy with TZIP-12 extension
 */
export type Tzip12Contract<TProvider extends ContractProvider | Wallet> =
  ContractAbstraction<TProvider> & {
    tzip12(this: ContractAbstraction<TProvider>): Tzip12ContractAbstraction;
  };

export type address = string;
export type nat = BigNumber | number;
export type mutez = BigNumber | number;
export type bytes = string;
export type unit = null;
