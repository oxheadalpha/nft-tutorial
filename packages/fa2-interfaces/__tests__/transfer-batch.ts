import { transferBatch } from '../src/transfer-batch';

describe('Test building a batch of transfers', () => {
  test('mergeing source correctly', () => {
    const transfers = transferBatch()
      .withTransfer('tzFrom1', 'tzTo1', 1, 1)
      .withTransfer('tzFrom1', 'tzTo2', 2, 1)
      .withTransfer('tzFrom2', 'tzTo1', 3, 1)
      .withTransfer('tzFrom1', 'tzTo3', 3, 1).transfers;

    expect(transfers).toHaveLength(3);
    expect(transfers[0].txs).toHaveLength(2);
    expect(transfers[0].txs[1]).toMatchObject({
      to_: 'tzTo2',
      token_id: 2,
      amount: 1
    });
  });
});
