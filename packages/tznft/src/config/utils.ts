import * as kleur from 'kleur';

import { configProvider } from './config-provider';
import { Config } from './parser';

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
    suggestCommand('init-config');
    throw new Error(msg);
  }
};

export const saveConfig = async (c: Config): Promise<void> => {
  const config = configProvider();
  await config.save(c);
  console.log(`${kleur.green(config.filePath)} config file was updated`);
};
