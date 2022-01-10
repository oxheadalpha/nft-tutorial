import { tzip12, Tzip12Module } from '@taquito/tzip12';

import {
  ContractMethod,
  ContractProvider,
  TezosToolkit
} from '@taquito/taquito';

import { Tzip12Contract, address } from './type-aliases';

/**
 * ContractCall describes a call to a contract that can be either run or
 * add to an existing batch. The run method does Tquito send(), and then wait
 * for conformation.
 * 
 * @returns a hash number of a confirmed operation
 */
export interface ContractCall {
  run: () => Promise<number>;
}

export interface ContractApi {
  with: <I extends ContractApi, O>(
    this: I,
    createApi: (contract: Tzip12Contract, lambdaView?: address) => O
  ) => I & O;
}

export interface TezosApi {
  at: (contractAddress: address) => Promise<ContractApi>;
  useLambdaView: (lambdaView: address) => TezosApi;
}

export const contractCall = (cm: ContractMethod<ContractProvider>): ContractCall => ({
  run: async () => {
    const op = await cm.send();
    const hash = await op.confirmation();
    return hash;
  }
});

const contractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): ContractApi => ({
  with(createApi) {
    return { ...this, ...createApi(contract, lambdaView) };
  }
});

export const tezosApi = (tzt: TezosToolkit, lambdaView?: address): TezosApi => {
  tzt.addExtension(new Tzip12Module());

  return {
    at: async (contractAddress: address) => {
      const contract = await tzt.contract.at(contractAddress, tzip12);
      return contractApi(contract, lambdaView);
    },

    useLambdaView: (lambdaView: address) => tezosApi(tzt, lambdaView)
  };
};
