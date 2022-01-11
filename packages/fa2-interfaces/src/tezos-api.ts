import { tzip12, Tzip12Module } from '@taquito/tzip12';
import { Tzip12Contract, address } from './type-aliases';
import { TezosToolkit } from '@taquito/taquito';

/**
 * Interface to create contract API builder
 */
export interface TezosApi {
  /**
   * Create API builder for the contract at specified address
   */
  at: (contractAddress: address) => Promise<ContractApi>;
  /**
   * Specify Taquito lambda view contract address to access contract CPS style
   * view entry points.
   */
  useLambdaView: (lambdaView: address) => TezosApi;
}

/**
 * Contract API builder
 */
export interface ContractApi {
  /**
   * Extend existing contract API
   * @typeParam I current contract API 
   * @typeParam O additional API to be composed with the current one
   * @param createApi extension function to create additional API for the contract
   */
  with: <I extends ContractApi, O>(
    this: I,
    createApi: (contract: Tzip12Contract, lambdaView?: address) => O
  ) => I & O;
}

const contractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): ContractApi => ({
  with(createApi) {
    return { ...this, ...createApi(contract, lambdaView) };
  }
});

/**
 * Create Tezos API to build modular contract APIs.
 * 
 * Usage example:
 * ```typescript
 * const tzt = new TezosToolkit(...);
 * 
 * const nftContract = 
 *   (await tezosApi(tz).at(contractAddress))
 *   .with(Nft).with(Fa2);
 * // mintTokens() is defined in Nft extension
 * await nftContract.mintTokens(...);
 * // transfer() is defined in Fa2 extension
 * await nftContract.transfer(...);
 * ```
 * @param tzt Taquito toolkit connecting to a block chain
 * @param lambdaView Taquito lambda view contract address to access contract CPS
 * style view entry points ([see](https://tezostaquito.io/docs/lambda_view/)).
 * You need to deploy lambda view contract and use it address with the sandbox.
 * @returns {@link TezosApi} object to build contract access proxies with specified
 * contract
 */
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
