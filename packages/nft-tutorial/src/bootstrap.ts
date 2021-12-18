import * as child from 'child_process';
import * as kleur from 'kleur';
import retry from 'async-retry';
import { loadUserConfig, inspectorKey } from './config-util';
import { createToolkit, originateInspector } from './contracts';
import Configstore from 'configstore';
import {startSandbox, killSandbox} from '@oxheadalpha/nft-contracts'

export async function bootstrap(): Promise<void> {
  try {
    const config = loadUserConfig();

    const network = config.get('activeNetwork');
    if (network === 'sandbox') {
      await startSandbox();
      console.log(kleur.yellow('starting sandbox...'));
      await awaitForNetwork();
      console.log(kleur.green('sandbox started'));
    }

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

async function awaitForNetwork(): Promise<void> {
  const config = loadUserConfig();
  const toolkit = await createToolkit('bob', config);
  await retry(
    async () => {
      console.log('connecting to Tezos node rpc...');
      await toolkit.rpc.getBlockHeader({ block: '2' });
    },
    { retries: 8 }
  );
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
