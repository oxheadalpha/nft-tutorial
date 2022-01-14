import kleur from 'kleur';
import path from 'path';
import * as fs from 'fs';
import { loadFile, loadUserConfig } from './config-util';
import { resolveAlias2Address } from './config-aliases';
import { validateTzip16, validateTzip21 } from '@oxheadalpha/fa2-interfaces';

export function createCollectionMeta(name: string): void {
  const meta = {
    name,
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
    tags: ['awesome', 'nft'],
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

export const validateCollectionMeta = async (
  metaFile: string,
  errorsOnly?: boolean
) => validateMeta(validateTzip16, 'TZIP-016', metaFile, errorsOnly);

export const validateNftMeta = async (metaFile: string, errorsOnly?: boolean) =>
  validateMeta(validateTzip21, 'TZIP-021', metaFile, errorsOnly);

async function validateMeta(
  validate: (meta: any) => string[],
  standardName: string,
  metaFile: string,
  errorsOnly?: boolean
) {
  const metaJson = await loadFile(metaFile);
  const meta = JSON.parse(metaJson);
  const results = validate(meta);

  const filteredResults = errorsOnly
    ? results.filter(r => r.startsWith('Error'))
    : results;

  if (filteredResults.length === 0) {
    console.log(kleur.green(`${standardName} metadata seems to be valid.`));
  } else {
    filteredResults.map(colorCodeMsg).forEach(msg => console.log(msg));
    process.exit(-1);
  }
}

function colorCodeMsg(msg: string): string {
  if (msg.startsWith('Error')) return kleur.red(msg);
  if (msg.startsWith('Warning')) return kleur.yellow(msg);
  return msg;
}
