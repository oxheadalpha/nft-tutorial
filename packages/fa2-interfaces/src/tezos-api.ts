import { tzip12, Tzip12Module } from '@taquito/tzip12';

import {
  BatchOperation,
  ContractMethod,
  ContractProvider,
  OperationBatch,
  TezosToolkit,
  TransactionOperation
} from '@taquito/taquito';

import { Tzip12Contract, address } from './type-aliases';

/**
 * A type-safe API to a contract at specific address that, by default,
 * has only one method "with". By chaining "with" it can be extended
 * to include multiple interfaces, like FA2, NFT, Admin etc.,
 * like this:
 *
 * ```typescript
 * contract.with(Fa2).with(Nft)
 * ```
 */
export interface ContractApi {
  /**
   * Extend existing contract API
   *
   * @typeParam I current contract API
   * @typeParam O additional API to be composed with the current one
   *
   * @param createApi a constructor function that should return
   * an object (a record of functions) to extend the current API with
   */
  with: <I extends ContractApi, O>(
    this: I,
    createApi: (contract: Tzip12Contract, lambdaView?: address) => O
  ) => I & O;
}

/**
 * Interface to create contract APIs
 */
export interface TezosApi {
  /**
   * Create an API to the contract at the specified address
   */
  at: (contractAddress: address) => Promise<ContractApi>;

  /**
   * Specify Taquito lambda view contract address to access contract CPS style
   * view entry points.
   */
  useLambdaView: (lambdaView: address) => TezosApi;

  /**
   * Underlying `TezosToolkit`
   */
  toolkit: TezosToolkit;
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

    useLambdaView: (lambdaView: address) => tezosApi(tzt, lambdaView),

    toolkit: tzt
  };
};

/**
 * Run and confirms a Taquito ContractMethod
 * @param cm - a Taquito ContractMethod
 * @returns  Taquito TransactionOperation
 *
 * Usage example:*
 * ```typescript
 * const op: TransactionOperation = await fa2.runMethod(fa2Contract.transferTokens(txs));
 * ```
 */
export const runMethod = async (
  cm: ContractMethod<ContractProvider>
): Promise<TransactionOperation> => {
  const op = await cm.send();
  await op.confirmation();
  return op;
};

/**
 * Run and confirms a Taquito batch
 * @param batch - a Taquito OperationBatch
 * @returns  Taquito BatchOperation
 *
 * Usage example:*
 * ```typescript
 * const batch = toolkit.contract.batch();
 * batch.withContractCall(fa2Contract.transferTokens(txs1));
 * * batch.withContractCall(fa2Contract.transferTokens(txs2));
 * const op: BatchOperation = await fa2.runBatch(batch);
 * ```
 */
export const runBatch = async (
  batch: OperationBatch
): Promise<BatchOperation> => {
  const op = await batch.send();
  await op.confirmation();
  return op;
};
