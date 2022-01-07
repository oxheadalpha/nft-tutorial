import { tzip12, Tzip12Module } from '@taquito/tzip12';
import { Tzip12Contract, address } from './type-aliases';
import { TezosToolkit } from '@taquito/taquito';

export interface TezosApi {
  at: (contractAddress: address) => Promise<ContractApi>;
  useLambdaView: (lambdaView: address) => TezosApi;
}

export interface ContractApi {
  with: <I extends ContractApi, O extends I>(
    extendApi: (
      inputApi: I,
      contract: Tzip12Contract,
      lambdaView?: address
    ) => O
  ) => O;
}

const contractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): ContractApi => ({
  with(extendApi) {
    return extendApi(this as any, contract, lambdaView);
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
