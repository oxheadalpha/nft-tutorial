import * as kleur from 'kleur';
import { validateAddress, ValidationResult } from '@taquito/utils';
import { InMemorySigner } from '@taquito/signer';
import { loadFile } from './config';
import { createToolkitFromSigner } from './contracts';
import { loadConfig, activeNetwork, Config, Alias, saveConfig } from './config';
import { newKeys } from '@oxheadalpha/tezos-tools';

export async function showAlias(alias: string): Promise<void> {
  const config = await loadConfig();
  if (alias) printAlias(alias, config);
  else printAllAliases(config);
}

function printAllAliases(config: Config) {
  const aliases = activeNetwork(config).aliases;
  const aliasNames = Object.keys(aliases);

  if (aliasNames.length > 0) {
    for (let n of aliasNames) {
      printAlias(n, config);
    }
  } else console.log(kleur.yellow('there are no configured aliases'));
}

function printAlias(alias: string, config: Config) {
  const aliasDef = activeNetwork(config).aliases[alias];
  if (aliasDef) console.log(formatAlias(alias, aliasDef));
  else console.log(kleur.red(`alias ${kleur.yellow(alias)} is not configured`));
}

function formatAlias(alias: string, def: Alias): string {
  return kleur.yellow(
    `${alias}\t${def.address}\t${def.secret ? def.secret : ''}`
  );
}

export async function addAlias(
  alias: string,
  key_or_address: string
): Promise<void> {
  const config = await loadConfig();
  const aliasDefByName = activeNetwork(config).aliases[alias];
  if (aliasDefByName) {
    console.log(kleur.red(`alias ${kleur.yellow(alias)} already exists`));
    return;
  }
  const aliasDef = await validateKey(key_or_address);
  if (!aliasDef) console.log(kleur.red('invalid address or secret key'));
  else {
    activeNetwork(config).aliases[alias] = {
      address: aliasDef.address,
      secret: aliasDef.secret
    };
    saveConfig(config);
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

export async function generateKeys(alias?: string): Promise<void> {
  const { pkh, secret } = await newKeys();
  console.log(
    kleur.green('new keys generated:') +
      formatAlias('', { secret, address: pkh })
  );
  if (alias) addAlias(alias, secret);
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

export async function removeAlias(alias: string): Promise<void> {
  const config = await loadConfig();
  const aliasDef = activeNetwork(config).aliases[alias];
  if (!aliasDef) {
    console.log(kleur.red(`alias ${kleur.yellow(alias)} does not exists`));
    return;
  }
  delete activeNetwork(config).aliases[alias];
  saveConfig(config);
  console.log(kleur.yellow(`alias ${kleur.green(alias)} has been deleted`));
}

const aliasByName = (name: string, config: Config) =>
  activeNetwork(config).aliases[name];

const aliasByAddress = (address: string, config: Config) =>
  validateAddress(address) == ValidationResult.VALID
    ? Object.values(activeNetwork(config).aliases).find(
        a => a?.address == address
      )
    : undefined;

export async function resolveAlias2Signer(
  aliasOrAddress: string,
  config: Config
): Promise<InMemorySigner> {
  const alias =
    aliasByName(aliasOrAddress, config) ||
    aliasByAddress(aliasOrAddress, config);

  return alias?.secret
    ? InMemorySigner.fromSecretKey(alias?.secret).catch(_ =>
        cannotResolve(aliasOrAddress)
      )
    : cannotResolve(aliasOrAddress);
}

export async function resolveAlias2Address(
  aliasOrAddress: string,
  config: Config
): Promise<string> {
  if (validateAddress(aliasOrAddress) === ValidationResult.VALID)
    return aliasOrAddress;

  const alias = activeNetwork(config).aliases[aliasOrAddress];
  return alias ? alias.address : cannotResolve(aliasOrAddress);
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
