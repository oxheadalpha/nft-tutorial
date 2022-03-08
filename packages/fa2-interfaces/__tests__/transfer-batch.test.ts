import { transferBatch } from '../src/transfer-batch';

describe('Test building a batch of transfers', () => {
  test('Merging sources correctly', () => {
    const batch = transferBatch()
      .withTransfer('tzFrom1', 'tzTo1', 1, 1)
      .withTransfer('tzFrom1', 'tzTo2', 2, 1)
      .withTransfer('tzFrom2', 'tzTo1', 3, 1);

    batch.withTransfer('tzFrom1', 'tzTo3', 3, 1);

    expect(batch.transfers).toEqual([
      {
        from_: 'tzFrom1',
        txs: [
          { to_: 'tzTo1', token_id: 1, amount: 1 },
          { to_: 'tzTo2', token_id: 2, amount: 1 }
        ]
      },
      { from_: 'tzFrom2', txs: [{ to_: 'tzTo1', token_id: 3, amount: 1 }] },
      { from_: 'tzFrom1', txs: [{ to_: 'tzTo3', token_id: 3, amount: 1 }] }
    ]);
  });
});
