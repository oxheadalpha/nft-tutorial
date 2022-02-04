import * as kleur from 'kleur';
import * as path from 'path';
import {
  address,
  createOffChainTokenMetadata
} from '@oxheadalpha/fa2-interfaces';
import { TezosToolkit } from '@taquito/taquito';
import { loadFile } from '../src/config';
import { createNftStorage, NftContract } from '../src/nft-interface';
import { originateContract } from '@oxheadalpha/tezos-tools';

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

export async function originateCollection(tzt: TezosToolkit): Promise<address> {
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

export const tokenMeta = (tokenId: number) =>
  createOffChainTokenMetadata(
    tokenId,
    'ipfs://QmbYcvb4B6dtEGAmHcUM9ZaMDBBJLFLh6Jsno218M9iQMU'
  );

export const mintTestTokens = (nft: NftContract, owner: address) => {
  const tokens = [1, 2].map(tokenMeta);
  return nft.mintTokens([{ owner, tokens }]);
};
