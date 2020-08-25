import * as child from 'child_process';
import * as kleur from 'kleur';
import retry from 'async-retry';
import { Tezos, TezosToolkit } from '@taquito/taquito';
import {
  loadUserConfig,
  activeNetworkKey,
  inspectorKey,
  aliasKey
} from './config-util';
import { createToolkit, originateInspector } from './contracts';
import Configstore from 'configstore';

export async function bootstrap(): Promise<void> {
  try {
    const config = loadUserConfig();

    const network = config.get('activeNetwork');
    if (network === 'sandbox') await startSandbox();

    await originateBalanceInspector(config, 'bob');
  } catch (err) {
    console.log(kleur.red('failed to start. ' + JSON.stringify(err)));
    return Promise.reject(err);
  }
}

export async function kill(): Promise<void> {
  const config = loadUserConfig();
  const network = config.get('activeNetwork');
  if (network === 'sandbox') await killSandbox();
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startSandbox(): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    //start and wait
    child.exec(
      'sh ../flextesa/start-sandbox.sh',
      { cwd: __dirname },
      (err, stdout, errout) => {
        if (err) {
          console.log(kleur.red('failed to start sandbox'));
          console.log(kleur.red().dim(errout));
          reject();
        } else {
          console.log(kleur.yellow().dim(stdout));
          resolve();
        }
      }
    )
  );
  console.log(kleur.yellow('starting sandbox...'));

  const config = loadUserConfig();
  const toolkit = await createToolkit('bob', config);
  await sleep(10000);
  await retry(
    async () => {
      console.log('rpc...');
      await toolkit.rpc.getBlockHeader({ block: '1' });
    },
    { retries: 6 }
  );
  await Tezos.rpc.getBlockHeader({ block: '1' });
  console.log(kleur.green('sandbox started'));
}

async function killSandbox(): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    child.exec(
      'sh ../flextesa/kill-sandbox.sh',
      { cwd: __dirname },
      (err, stdout, errout) => {
        if (err) {
          console.log(kleur.red('failed to stop sandbox'));
          console.log(kleur.red().dim(errout));
          reject(err);
        } else {
          console.log(kleur.yellow().dim(stdout));
          resolve();
        }
      }
    )
  );
  console.log(kleur.yellow('killed sandbox.'));
}

async function originateBalanceInspector(
  config: Configstore,
  orig_alias: string
): Promise<void> {
  console.log(kleur.yellow(`originating balance inspector contract...`));

  const tezos = await createToolkit(orig_alias, config);
  const inspectorAddress = await originateInspector(tezos);

  config.set(inspectorKey(config), inspectorAddress);

  console.log(
    kleur.yellow(
      `originated balance inspector ${kleur.green(inspectorAddress)}`
    )
  );
}
