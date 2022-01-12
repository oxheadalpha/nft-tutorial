import * as kleur from 'kleur';
import * as path from 'path';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit } from '@taquito/taquito';

import { address, Fa2, runMethod, runBatch } from '@oxheadalpha/fa2-interfaces';
import { originateContract } from '@oxheadalpha/tezos-tools';

import { loadFile } from '../src/config-util';
import {
  createNftStorage,
  createTokenMetadata,
  Nft,
  NftContract
} from '../src/nft-interface';

import { TestApi, bootstrap } from './test-bootstrap';

jest.setTimeout(240000);

const tzip16Meta = {
  name: 'Test',
  description: 'Awesome NFT collection',
  homepage: 'https://github.com/oxheadalpha/nft-tutorial',
  authors: ['John Doe <john.doe@johndoe.com>'],
  version: '1.0.0',
  license: { name: 'MIT' },
  interfaces: ['TZIP-016', 'TZIP-012', 'TZIP-021'],
  source: {
    tools: ['LIGO'],
    location: 'https://github.com/oxheadalpha/nft-tutorial'
  }
};

async function originateCollection(tzt: TezosToolkit): Promise<address> {
  console.log(kleur.yellow('originating NFT collection contract...'));

  const code = await loadFile(path.join(__dirname, '../dist/fa2_nft_asset.tz'));
  const ownerAddress = await tzt.signer.publicKeyHash();
  const storage = createNftStorage(
    ownerAddress,
    JSON.stringify(tzip16Meta, null, 2)
  );
  const contract = await originateContract(tzt, code, storage, 'nft');
  return contract.address;
}

const tokenMeta = (tokenId: number) =>
  createTokenMetadata(
    tokenId,
    'ipfs://QmbYcvb4B6dtEGAmHcUM9ZaMDBBJLFLh6Jsno218M9iQMU'
  );

describe('NFT Collection Tests', () => {
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

  const mintTestTokens = (nft : NftContract) => {
    const tokens = [1, 2].map(tokenMeta);
    return nft.mintTokens([{ owner: bobAddress, tokens }]);
  }

  test('mint', async () => {
    const nft = (await api.bob.at(collectionAddress)).with(Nft);
    await runMethod(mintTestTokens(nft));

    const fa2 = nft.with(Fa2);
    const meta = await fa2.tokensMetadata([1, 2]);
    expect(meta.map(t => t.token_id)).toEqual([1, 2]);

    const ownership = await fa2.hasNftTokens([
      { owner: bobAddress, token_id: new BigNumber(1) },
      { owner: bobAddress, token_id: new BigNumber(1) }
    ]);
    expect(ownership).toEqual([true, true]);
  });

  test('mint and freeze', async () => {
    const nft = (await api.bob.at(collectionAddress)).with(Nft);

    const batch = api.bob.toolkit.contract.batch();
    batch.withContractCall(mintTestTokens(nft));
    batch.withContractCall(nft.freezeCollection());
    console.log(kleur.yellow('minting tokens...'));
    await runBatch(batch);
    console.log(kleur.green('minted tokens'));

    const extraTokens = [tokenMeta(3)];
    const run = runMethod(
      nft.mintTokens([{ owner: bobAddress, tokens: extraTokens }])
    );
    await expect(run).rejects.toHaveProperty('message', 'FROZEN');
  });

  test('mint duplicate tokens', async () => {
    const nft = (await api.bob.at(collectionAddress)).with(Nft);
    await runMethod(mintTestTokens(nft));

    const extraTokens = [tokenMeta(1)];
    const run = runMethod(
      nft.mintTokens([{ owner: bobAddress, tokens: extraTokens }])
    );
    await expect(run).rejects.toHaveProperty('message', 'USED_TOKEN_ID');
  });
});
