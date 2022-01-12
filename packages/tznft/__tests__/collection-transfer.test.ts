import * as kleur from 'kleur';
import { BigNumber } from 'bignumber.js';
import {
  address,
  Fa2,
  runMethod,
  runBatch,
  Transfer,
  Fa2Contract
} from '@oxheadalpha/fa2-interfaces';
import { Nft } from '../src/nft-interface';

import { TestApi, bootstrap } from './test-bootstrap';
import { mintTestTokens, originateCollection } from './collection-bootstrap';

jest.setTimeout(240000);

describe('FA2 Token Transfer Tests', () => {
  let api: TestApi;
  let bobAddress: address;
  let aliceAddress: address;
  let collectionAddress: address;

  beforeAll(async () => {
    const tzApi = await bootstrap();
    api = tzApi;
    bobAddress = await tzApi.bob.toolkit.signer.publicKeyHash();
    aliceAddress = await tzApi.alice.toolkit.signer.publicKeyHash();
  });

  beforeEach(async () => {
    collectionAddress = await originateCollection(api.bob.toolkit);
    const nft = (await api.bob.at(collectionAddress)).with(Nft);
    await runMethod(mintTestTokens(nft, bobAddress));
  });

  function nftTransfer(
    from_: address,
    to_: address,
    tokenId: number
  ): Transfer {
    return {
      from_,
      txs: [{ to_, token_id: new BigNumber(tokenId), amount: new BigNumber(1) }]
    };
  }

  const testTokensOwnership = async (
    fa2: Fa2Contract,
    owner: address
  ): Promise<boolean[]> =>
    fa2.hasNftTokens([
      { owner, token_id: new BigNumber(1) },
      { owner, token_id: new BigNumber(2) }
    ]);

  test('transfer', async () => {
    const fa2 = (await api.bob.at(collectionAddress)).with(Fa2);
    await runMethod(
      fa2.transferTokens([nftTransfer(bobAddress, aliceAddress, 1)])
    );

    const bobOwnership = await testTokensOwnership(fa2, bobAddress);
    expect(bobOwnership).toEqual([false, true]);
    const aliceOwnership = await testTokensOwnership(fa2, aliceAddress);
    expect(aliceOwnership).toEqual([true, false]);
  });
});
