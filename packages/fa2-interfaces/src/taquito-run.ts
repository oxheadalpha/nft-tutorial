import {
  BatchOperation,
  ContractMethod,
  ContractProvider,
  OperationBatch,
  SendParams,
  TransactionOperation,
  TransactionWalletOperation,
  Wallet,
  WalletOperation,
  WalletOperationBatch
} from '@taquito/taquito';
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation';

/**
 * Run and confirms a Taquito ContractMethod
 * @param cm - a Taquito ContractMethod
 * @returns  Taquito TransactionOperation
 *
 * Usage example:
 * ```typescript
 * const op: TransactionOperation = await fa2.runMethod(fa2Contract.transferTokens(txs));
 * ```
 */
export const runMethod = async <TProvider extends ContractProvider | Wallet>(
  cm: ContractMethod<TProvider>,
  sendParams?: SendParams
): Promise<TransactionWalletOperation | TransactionOperation> => {
  const op = await cm.send(sendParams);
  await op.confirmation();
  return op;
};

/**
 * Run and confirms a Taquito batch
 * @param batch - a Taquito OperationBatch
 * @returns  Taquito BatchOperation
 *
 * Usage example:
 * ```typescript
 * const batch = toolkit.contract.batch();
 *
 * batch.withContractCall(fa2Contract.transferTokens(txs1));
 * batch.withContractCall(fa2Contract.transferTokens(txs2));
 *
 * const op: BatchOperation = await fa2.runBatch(batch);
 * ```
 */
export const runBatch = async (
  batch: OperationBatch | WalletOperationBatch
): Promise<BatchOperation | BatchWalletOperation> => {
  const op = await batch.send();
  await op.confirmation();
  return op;
};
