import * as kleur from 'kleur';
import { loadConfig, saveConfig } from './config';

export async function showActiveNetwork(all: boolean): Promise<void> {
  const config = await loadConfig();
  const network = config.activeNetwork;
  if (!all)
    console.log(
      `active network: ${
        network ? kleur.green(network) : kleur.red('not selected')
      }`
    );
  else {
    const networkNames = Object.keys(config.availableNetworks);
    for (let n of networkNames) {
      if (n === network) console.log(kleur.bold().green(`* ${n}`));
      else console.log(kleur.yellow(`  ${n}`));
    }
    if (!network) console.log(`active network: ${kleur.red('not selected')}`);
  }
}

export async function setNetwork(network: string): Promise<void> {
  const config = await loadConfig();
  if (!config.availableNetworks[network])
    console.log(
      kleur.red(
        `network ${kleur.yellow(network)} is not available in configuration`
      )
    );
  else {
    config.activeNetwork = network;
    saveConfig(config);
    console.log(`network ${kleur.green(network)} is selected`);
  }
}

export async function showConfig(): Promise<void> {
  const config = await loadConfig();
  const c = JSON.stringify(config, null, 2);
  console.info(c);
}
