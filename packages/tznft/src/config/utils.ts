import * as path from 'path';
import { promises as fs } from 'fs';
import * as kleur from 'kleur';

import { Network, Config } from './parser';
import { configProvider } from './config-provider';

const suggestCommand = (cmd: string) => {
  console.log(`Try to run ${kleur.green(`tznft ${cmd}`)} command first`);
};

export const initConfig = async (): Promise<void> => {
  const config = configProvider();
  if (await config.exists()) {
    console.log(kleur.yellow(`${config.filePath} config file already exists`));
  } else {
    await config.createDefault();
    console.log(`${kleur.green(config.filePath)} config file created`);
  }
};

export const loadConfig = async (): Promise<Config> => {
  const config = configProvider();

  if (await config.exists()) {
    return config.load();
  } else {
    const msg = `Config file ${config.filePath} does not exist`;
    console.log(kleur.red(msg));
    suggestCommand('init');
    throw new Error(msg);
  }
};

export const saveConfig = async (c: Config): Promise<void> => {
  const config = configProvider();
  await config.save(c);
  console.log(`${kleur.green(config.filePath)} config file was updated`);
};

export const activeNetwork = (c: Config): Network => {
  const network = c.availableNetworks[c.activeNetwork];

  if (!network)
    throw new Error(
      `Invalid active network in config ${kleur.yellow(c.activeNetwork)}`
    );

  return network;
};

export async function loadFile(filePath: string): Promise<string> {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  try {
    await fs.access(resolvedPath);
  } catch {
    throw new Error(`file ${resolvedPath} does not exist`);
  }

  const text = await fs.readFile(resolvedPath, { encoding: 'utf8', flag: 'r' });
  return text;
}
