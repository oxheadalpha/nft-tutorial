import { pinFile, pinDirectory } from '@oxheadalpha/tezos-tools';
import { loadUserConfig } from './config-util';
import * as kleur from 'kleur';
import * as path from 'path';
import * as fs from 'fs';

const ipfsKey = 'ipfs-pinata';

export async function setPinataKeys(
  apiKey: string,
  secretKey: string,
  force: boolean
) {
  console.log(apiKey, secretKey, force);
  const config = loadUserConfig();
  if (config.has(ipfsKey) && !force) {
    console.log(
      kleur.red('Pinata keys already exist. Use --force option to override.')
    );
    return;
  }
  config.set(ipfsKey, { apiKey, secretKey });
  console.log(kleur.green('Pinata keys have been added.'));
}

type PinataKeys = { apiKey: string; secretKey: string };

export async function pinFileToIpfs(tag: string, filePath: string) {
  const pinataKeys = loadPinataKeys();
  if(!pinataKeys) return;

  const resolvedPath = resolvePath(filePath);
  if(!resolvedPath) return;

  const cid = await pinFile(
    pinataKeys.apiKey,
    pinataKeys.secretKey,
    tag,
    resolvedPath
  );

  console.log(kleur.green(`ipfs://${cid}`));
}

export async function pinDirectoryToIpfs(tag: string, dirPath: string) {
  const pinataKeys = loadPinataKeys();
  if(!pinataKeys) return;

  const resolvedPath = resolvePath(dirPath);
  if(!resolvedPath) return;

  const cid = await pinDirectory(
    pinataKeys.apiKey,
    pinataKeys.secretKey,
    tag,
    resolvedPath
  );

  console.log(kleur.green(`ipfs://${cid}`));
}

function loadPinataKeys() : PinataKeys | undefined {
  const config = loadUserConfig();
  if (!config.has(ipfsKey)) {
    console.log(
      kleur.red(
        'Pinata keys are not configured. Run set-pinata-keys command first.'
      )
    );
    return undefined;
  }
  return config.get(ipfsKey);
}

function resolvePath(fileOrDir: string): string | undefined {
  const resolvedPath = path.isAbsolute(fileOrDir)
    ? fileOrDir
    : path.join(process.cwd(), fileOrDir);
  if (!fs.existsSync(resolvedPath)) {
    console.log(kleur.red(`Path ${resolvedPath} does not exist.`));
    return undefined;
  }
  return resolvedPath;
}
