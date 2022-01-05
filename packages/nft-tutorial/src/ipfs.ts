import { pinFile, pinDirectory } from '@oxheadalpha/nft-contracts';
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
  const config = loadUserConfig();
  if (!config.has(ipfsKey)) {
    console.log(
      kleur.red(
        'Pinata keys are not configured. Run set-pinata-keys command first.'
      )
    );
    return;
  }
  const pinataKeys: PinataKeys = config.get(ipfsKey);

  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.log(kleur.red(`File ${resolvedPath} does not exist.`));
    return;
  }

  const cid = await pinFile(
    pinataKeys.apiKey,
    pinataKeys.secretKey,
    tag,
    resolvedPath
  );

  console.log(kleur.green(`cid:${cid}`));
}

export async function pinDirectoryToIpfs(tag: string, dirPath: string) {
  const config = loadUserConfig();
  if (!config.has(ipfsKey)) {
    console.log(
      kleur.red(
        'Pinata keys are not configured. Run set-pinata-keys command first.'
      )
    );
    return;
  }
  const pinataKeys: PinataKeys = config.get(ipfsKey);

  const resolvedPath = path.isAbsolute(dirPath)
    ? dirPath
    : path.join(process.cwd(), dirPath);
  if (!fs.existsSync(resolvedPath)) {
    console.log(kleur.red(`Directory ${resolvedPath} does not exist.`));
    return;
  }

  const cid = await pinDirectory(
    pinataKeys.apiKey,
    pinataKeys.secretKey,
    tag,
    resolvedPath
  );

  console.log(kleur.green(`cid:${cid}`));
}
