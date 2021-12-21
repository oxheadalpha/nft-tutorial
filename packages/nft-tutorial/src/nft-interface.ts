import { address, TokenMetadata } from '@oxheadalpha/fa2-interfaces';
import { TezosToolkit } from '@taquito/taquito';
import kleur from 'kleur';

export interface MintParam {
  owner: address;
  tokens: TokenMetadata[];
}

export async function mintTokens(
  nftAddress: address,
  tz: TezosToolkit,
  tokens: MintParam[]
) {
  console.log(kleur.yellow('minting tokens...'));

  const contract = await tz.contract.at(nftAddress);
  const op = await contract.methods.mint(tokens).send();
  await op.confirmation();

  console.log(kleur.green('tokens minted'));
}

export async function freezeCollection(nftAddress: address, tz: TezosToolkit) {
  console.log(kleur.yellow('freezing nft collection...'));

  const contract = await tz.contract.at(nftAddress);
  const op = await contract.methods.freeze().send();
  await op.confirmation();

  console.log(kleur.green('nft collection frozen'));
}
