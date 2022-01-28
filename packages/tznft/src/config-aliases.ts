import Configstore from 'configstore';
import * as kleur from 'kleur';
import { validateAddress, ValidationResult } from '@taquito/utils';
import { InMemorySigner } from '@taquito/signer';
import {
  loadUserConfig,
  loadFile,
  allAliasesKey,
  aliasKey
} from './config-util';
import { createToolkitFromSigner } from './contracts';
import { loadConfig, activeNetwork, Config } from './config';

export function showAlias(alias: string): void {
  const config = loadUserConfig();
  if (alias) printAlias(alias, config);
  else printAllAliases(config);
}

function printAllAliases(config: Configstore) {
  const allAliasesCfg = config.get(allAliasesKey(config));
  if (allAliasesCfg) {
    const allAliases = Object.getOwnPropertyNames(allAliasesCfg);
    for (let a of allAliases) {
      printAlias(a, config);
    }
  } else console.log(kleur.yellow('there are no configured aliases'));
}

function printAlias(alias: string, config: Configstore) {
  const aliasDef = config.get(aliasKey(alias, config));
  if (aliasDef) console.log(formatAlias(alias, aliasDef));
  else console.log(kleur.red(`alias ${kleur.yellow(alias)} is not configured`));
}

function formatAlias(alias: string, def: any): string {
  return kleur.yellow(
    `${alias}\t${def.address}\t${def.secret ? def.secret : ''}`
  );
}

export async function addAlias(
  alias: string,
  key_or_address: string
): Promise<void> {
  const config = loadUserConfig();
  const ak = aliasKey(alias, config);
  if (config.has(ak)) {
    console.log(kleur.red(`alias ${kleur.yellow(alias)} already exists`));
    return;
  }
  const aliasDef = await validateKey(key_or_address);
  if (!aliasDef) console.log(kleur.red('invalid address or secret key'));
  else {
    config.set(ak, {
      address: aliasDef.address,
      secret: aliasDef.secret
    });
    console.log(kleur.yellow(`alias ${kleur.green(alias)} has been added`));
  }
}

export async function addAliasFromFaucet(
  alias: string,
  faucetFile: string
): Promise<void> {
  //load file
  const faucetContent = await loadFile(faucetFile);
  const faucet = JSON.parse(faucetContent);

  //create signer
  const signer = await InMemorySigner.fromFundraiser(
    faucet.email,
    faucet.password,
    faucet.mnemonic.join(' ')
  );
  await activateFaucet(signer, faucet.activation_code);

  const secretKey = await signer.secretKey();
  await addAlias(alias, secretKey);
}

async function activateFaucet(
  signer: InMemorySigner,
  secret: string
): Promise<void> {
  const config = await loadConfig();
  const tz = createToolkitFromSigner(signer, config);
  const address = await signer.publicKeyHash();
  const bal = await tz.tz.getBalance(address);
  if (bal.eq(0)) {
    console.log(kleur.yellow('activating faucet account...'));
    const op = await tz.tz.activate(address, secret);
    await op.confirmation();
    console.log(kleur.yellow('faucet account activated'));
  }
}

interface AliasDef {
  address: string;
  secret?: string;
  signer?: InMemorySigner;
}
async function validateKey(
  key_or_address: string
): Promise<AliasDef | undefined> {
  if (validateAddress(key_or_address) === ValidationResult.VALID)
    return { address: key_or_address };
  else
    try {
      const signer = await InMemorySigner.fromSecretKey(key_or_address);
      const address = await signer.publicKeyHash();
      return { address, secret: key_or_address, signer };
    } catch {
      return undefined;
    }
}

export function removeAlias(alias: string): void {
  const config = loadUserConfig();
  const ak = aliasKey(alias, config);
  if (!config.has(ak)) {
    console.log(kleur.red(`alias ${kleur.yellow(alias)} does not exists`));
    return;
  }
  config.delete(ak);
  console.log(kleur.yellow(`alias ${kleur.green(alias)} has been deleted`));
}

export async function resolveAlias2Signer(
  aliasOrAddress: string,
  config: Config
): Promise<InMemorySigner> {
  const alias = activeNetwork(config).aliases[aliasOrAddress]
  if (alias?.secret) {
    const ad = await validateKey(alias.secret);
    if (ad?.signer) return ad.signer;
  }

  if (validateAddress(aliasOrAddress) !== ValidationResult.VALID)
    return cannotResolve(aliasOrAddress);

  const aliasWithAddress = Object.values(activeNetwork(config).aliases).find(a => a?.address == aliasOrAddress)
  if (!aliasWithAddress?.secret) return cannotResolve(aliasOrAddress);

  return InMemorySigner.fromSecretKey(aliasWithAddress.secret);
}

export async function resolveAlias2Address(
  aliasOrAddress: string,
  config: Config
): Promise<string> {
  if (validateAddress(aliasOrAddress) === ValidationResult.VALID)
    return aliasOrAddress;

  const alias = activeNetwork(config).aliases[aliasOrAddress];
  if (!alias) return cannotResolve(aliasOrAddress);
  return alias.address;
}

function cannotResolve<T>(alias_or_address: string): Promise<T> {
  console.log(
    kleur.red(
      `${kleur.yellow(
        alias_or_address
      )} is not a valid address or configured alias`
    )
  );
  return Promise.reject('cannot resolve address or alias');
}
