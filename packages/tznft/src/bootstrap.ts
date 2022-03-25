import * as kleur from 'kleur';
import { loadConfig } from './config';
import { createToolkitWithoutSigner } from './contracts';
import {
  startSandbox,
  killSandbox,
  awaitForSandbox
} from '@oxheadalpha/tezos-tools';

export async function bootstrap(): Promise<void> {
  try {
    const config = await loadConfig();

    const network = config.activeNetwork;
    if (network === 'sandbox') {
      await startSandbox();
      console.log(kleur.yellow('starting sandbox...'));
      await awaitForNetwork();
      console.log(kleur.green('sandbox started'));
    }
  } catch (err) {
    console.log(kleur.red('failed to start. ' + JSON.stringify(err)));
    return Promise.reject(err);
  }
}

export async function kill(): Promise<void> {
  const config = await loadConfig();
  const network = config.activeNetwork;
  if (network === 'sandbox') await killSandbox();
}

async function awaitForNetwork(): Promise<void> {
  const config = await loadConfig();
  const toolkit = await createToolkitWithoutSigner(config);
  await awaitForSandbox(toolkit);
}
