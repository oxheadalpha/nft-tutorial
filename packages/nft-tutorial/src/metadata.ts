import kleur from 'kleur';
import path from 'path';
import * as fs from 'fs';
import { loadFile, loadUserConfig } from './config-util';
import { resolveAlias2Address } from './config-aliases';
import { validateTzip16 } from '@oxheadalpha/fa2-interfaces';

export function createCollectionMeta(name: string): void {
  const meta = {
    name,
    description: '',
    homepage: '',
    authors: ['john.doe@johndoe.com'],
    version: '1.0.0',
    license: { name: 'MIT' },
    interfaces: ['TZIP-016', 'TZIP-012', 'TZIP-021'],
    source: {
      tools: ['LIGO'],
      location: 'https://github.com/oxheadalpha/nft-tutorial'
    }
  };
  const json = JSON.stringify(meta, undefined, 2);
  const fileName = path.join(process.cwd(), name + '.json');
  fs.writeFileSync(fileName, json);
  console.log(kleur.green(`Created collection metadata file ${fileName}`));
}

export async function createNftMeta(
  name: string,
  minter: string,
  artifactUri: string
): Promise<void> {
  const config = loadUserConfig();
  const minterAddress = await resolveAlias2Address(minter, config);
  const meta = {
    decimals: 0,
    isBooleanAmount: true,
    name,
    description: '',
    tags: ['awsome', 'nft'],
    minter: minterAddress,
    artifactUri,
    displayUri: artifactUri,
    thumbnailUri: artifactUri,
    creators: [],
    rights: '',
    attributes: [{ name: 'sample attribute', value: 'sample value' }]
  };
  const json = JSON.stringify(meta, undefined, 2);
  const fileName = path.join(process.cwd(), name + '.json');
  fs.writeFileSync(fileName, json);
  console.log(kleur.green(`Created token metadata sample file ${fileName}`));
}

export async function validateCollectionMeta(metaFile: string) {
  const metaJson = await loadFile(metaFile);
  const meta = JSON.parse(metaJson);
  const results = validateTzip16(meta);

  if (!results)
    console.log(kleur.green('TZIP-016 metadata seems to be valid.'));
  else {
    results
      .map(colorCodeMsg)
      .forEach(msg => console.log(msg));
  }
}

function colorCodeMsg(msg: string): string {
  if (msg.startsWith('Error')) return kleur.red(msg);
  if (msg.startsWith('Warning')) return kleur.yellow(msg);
  return msg;
}
