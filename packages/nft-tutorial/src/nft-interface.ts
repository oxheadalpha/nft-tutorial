import kleur from 'kleur';

import {
  Tzip12Contract,
  address,
  TokenMetadataInternal
} from '@oxheadalpha/fa2-interfaces';

export interface MintParam {
  owner: address;
  tokens: TokenMetadataInternal[];
}

export interface NftContract {
  mintTokens: (tokens: MintParam[]) => Promise<void>;
  freezeCollection: () => Promise<void>;
}

export const Nft = (
  contract: Tzip12Contract,
): NftContract => ({
  mintTokens: async tokens => {
    console.log(kleur.yellow('minting tokens...'));

    const op = await contract.methods.mint(tokens).send();
    await op.confirmation();

    console.log(kleur.green('tokens minted'));
  },

  freezeCollection: async () => {
    console.log(kleur.yellow('freezing nft collection...'));

    const op = await contract.methods.mint_freeze().send();
    await op.confirmation();

    console.log(kleur.green('nft collection frozen'));
  }
});
