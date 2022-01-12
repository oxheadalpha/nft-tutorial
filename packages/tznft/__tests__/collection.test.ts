import * as kleur from 'kleur';
import * as path from 'path';
import { TezosToolkit } from '@taquito/taquito';

import { address } from '@oxheadalpha/fa2-interfaces';
import { originateContract } from '@oxheadalpha/tezos-tools';

import { loadFile } from '../src/config-util';
import { createNftStorage } from '../src/nft-interface';

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

  test('dummy', () => {
    console.log('HELLO', collectionAddress);
  });
});
