import { address, nat } from './type-aliases';
import { OperatorUpdate, OperatorUpdateParams } from './fa2-interface';

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
