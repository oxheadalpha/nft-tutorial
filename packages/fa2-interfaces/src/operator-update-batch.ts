import { address, nat } from './type-aliases';
import { OperatorUpdate, OperatorUpdateParams } from './interfaces/fa2';

export type OperatorUpdateBatch = {
  updates: OperatorUpdate[];

  addOperator: (
    owner: address,
    operator: address,
    tokenId: nat
  ) => OperatorUpdateBatch;

  addOperators: (additions: OperatorUpdateParams[]) => OperatorUpdateBatch;

  removeOperator: (
    owner: address,
    operator: address,
    tokenId: nat
  ) => OperatorUpdateBatch;

  removeOperators: (removals: OperatorUpdateParams[]) => OperatorUpdateBatch;
};

/**
 * A batch builder that can create operator updates the method
 * Fa2Contract.updateOperators. It can combine add & remove operator operations
 * into one batch like this:
 *
 * const batch = operatorUpdateBatch().
 *   .addOperator('tzOwner1', 'tzOperator1', 1)
 *   .removeOperator('tzOwner2, 'tzOperator2', 2)
 *   .addOperators([
 *     { owner: 'tzOwner3', operator: 'tzOperator3', token_id: 3 },
 *     { owner: 'tzOwner4', operator: 'tzOperator4', token_id: 4 }
 *   ])
 *   .updates;
 *
 * contract.updateOperators(batch);
 *
 * @param updates a list of either AddOperator or RemoveOperator
 * @returns a batch of updates that can be used in updateOperators
 */
export const operatorUpdateBatch = (
  updates: OperatorUpdate[] = []
): OperatorUpdateBatch => {
  const self = {
    updates,

    addOperator: (
      owner: address,
      operator: address,
      tokenId: nat
    ): OperatorUpdateBatch =>
      self.addOperators([{ owner, operator, token_id: tokenId }]),

    addOperators: (additions: OperatorUpdateParams[]): OperatorUpdateBatch => {
      additions.forEach(a => updates.push({ add_operator: a }));
      return self;
    },

    removeOperator: (
      owner: address,
      operator: address,
      tokenId: nat
    ): OperatorUpdateBatch =>
      self.removeOperators([{ owner, operator, token_id: tokenId }]),

    removeOperators: (
      removals: OperatorUpdateParams[]
    ): OperatorUpdateBatch => {
      removals.forEach(r => updates.push({ remove_operator: r }));
      return self;
    }
  };

  return self;
};
