import * as kleur from 'kleur';
import { address, runMethod, runBatch } from '@oxheadalpha/fa2-interfaces';

import { TestApi, bootstrap } from './test-bootstrap';
import {
  mintTestTokens,
  originateCollection,
  tokenMeta
} from './collection-bootstrap';

jest.setTimeout(240000);

describe('NFT Collection Minting Tests', () => {
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
  });

  test('mint', async () => {
    const nft = (await api.bob.at(collectionAddress)).asNft().withMint();
    await runMethod(mintTestTokens(nft, bobAddress));

    const fa2 = nft.withFa2();
    const meta = await fa2.tokensMetadata([1, 2]);
    expect(meta.map(t => t.token_id)).toEqual([1, 2]);

    const ownership = await fa2.hasNftTokens([
      { owner: bobAddress, token_id: 1 },
      { owner: bobAddress, token_id: 2 }
    ]);
    expect(ownership).toEqual([true, true]);
  });

  test('mint and freeze', async () => {
    const nft = (await api.bob.at(collectionAddress))
      .asNft()
      .withMint()
      .withFreeze();

    const batch = api.bob.toolkit.contract.batch();
    batch.withContractCall(mintTestTokens(nft, bobAddress));
    batch.withContractCall(nft.mintFreeze());
    await runBatch(batch);

    const extraTokens = [tokenMeta(3)];
    const run = runMethod(
      nft.mint([{ owner: bobAddress, tokens: extraTokens }])
    );
    await expect(run).rejects.toHaveProperty('message', 'FROZEN');
  });

  test('mint duplicate tokens', async () => {
    const nft = (await api.bob.at(collectionAddress)).asNft().withMint();
    await runMethod(mintTestTokens(nft, bobAddress));

    const extraTokens = [tokenMeta(1)];
    const run = runMethod(
      nft.mint([{ owner: bobAddress, tokens: extraTokens }])
    );
    await expect(run).rejects.toHaveProperty('message', 'USED_TOKEN_ID');
  });

  test('non-admin mint tokens', async () => {
    const nft = (await api.alice.at(collectionAddress)).asNft().withMint();
    const run = runMethod(mintTestTokens(nft, bobAddress));

    await expect(run).rejects.toHaveProperty('message', 'NOT_AN_ADMIN');
  });
});
