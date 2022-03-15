import {
  BatchOperation,
  ContractMethod,
  ContractProvider,
  OperationBatch,
  SendParams,
  TransactionOperation
} from '@taquito/taquito';

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
export const runMethod = async (
  cm: ContractMethod<ContractProvider>,
  sendParams?: SendParams
): Promise<TransactionOperation> => {
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
  batch: OperationBatch
): Promise<BatchOperation> => {
  const op = await batch.send();
  await op.confirmation();
  return op;
};
