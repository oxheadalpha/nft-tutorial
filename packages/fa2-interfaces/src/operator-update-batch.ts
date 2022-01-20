import { address, nat } from './type-aliases';
import { OperatorUpdate, OperatorUpdateParams } from './fa2-interface';

/**
 * A batch builder that can create operator updates the method
 * Fa2Contract.updateOperators. It can combine add & remove operator operations
 * into one batch like this:
 * 
 * const batch = operatorUpdateBatch().
 *   .addOperator('tzOwner1', 'tzOperator1', 1)
 *   .removeOperator('tzOwner2, 'tzOperator2', 2)
 *   .addOperators([
 *     { owner: 'tzOnwer3', operator: 'tzOperator3', token_id: 3 },
 *     { owner: 'tzOnwer4', operator: 'tzOperator4', token_id: 4 }
 *   ])
 *   .updates;
 * 
 * contract.updateOperators(batch);
 * 
 * @param updates a list of either AddOperator or RemoveOperator
 * @returns a batch of updates that can be used in updateOperators
 */
export const operatorUpdateBatch = (updates: OperatorUpdate[] = []) => {
  const self = {
    updates,

    addOperator: (owner: address, operator: address, tokenId: nat) =>
      self.addOperators([{ owner, operator, token_id: tokenId }]),

    addOperators: (additions: OperatorUpdateParams[]) =>
      operatorUpdateBatch(
        additions.reduce((a, u) => [...a, { add_operator: u }], updates)
      ),

    removeOperator: (owner: address, operator: address, tokenId: nat) =>
      self.removeOperators([{ owner, operator, token_id: tokenId }]),

    removeOperators: (removals: OperatorUpdateParams[]) =>
      operatorUpdateBatch(
        removals.reduce((a, u) => [...a, { remove_operator: u }], updates)
      )
  };

  return self;
};
