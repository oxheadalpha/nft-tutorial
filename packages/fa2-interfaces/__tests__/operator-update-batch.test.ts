import { operatorUpdateBatch } from '../src/operator-update-batch';

describe('Test building a batch of operator updates.', () => {
  test('Mixing addOperator & removeOperator correctly.', () => {
    const batch = operatorUpdateBatch()
      .addOperator('tzOwner1', 'tzOperator1', 1)
      .removeOperator('tzOwner2', 'tzOperator2', 2)
      .addOperators([
        { owner: 'tzOwner3', operator: 'tzOperator3', token_id: 3 }
      ]);

    batch.removeOperators([
      { owner: 'tzOwner4', operator: 'tzOperator4', token_id: 4 }
    ]);

    expect(batch.updates).toEqual([
      {
        add_operator: {
          owner: 'tzOwner1',
          operator: 'tzOperator1',
          token_id: 1
        }
      },
      {
        remove_operator: {
          owner: 'tzOwner2',
          operator: 'tzOperator2',
          token_id: 2
        }
      },
      {
        add_operator: {
          owner: 'tzOwner3',
          operator: 'tzOperator3',
          token_id: 3
        }
      },
      {
        remove_operator: {
          owner: 'tzOwner4',
          operator: 'tzOperator4',
          token_id: 4
        }
      }
    ]);
  });
});
