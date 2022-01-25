import { promises as fs } from 'fs';
import * as kleur from 'kleur';
import * as path from 'path';

import {
  configStorage as storageParser,
  Config,
  ConfigStorage
} from './parser';

import { defaultStorage } from './defaultStorage';

const defaultFileName = 'tznft.json';

export const configStorage = (fileName?: string) => {
  const name = fileName ? fileName : defaultFileName;

  const filePath = path.isAbsolute(name)
    ? name
    : path.join(process.cwd(), name);

  const loadStorage = async () => {
    const text = await fs.readFile(filePath, { encoding: 'utf8', flag: 'r' });
    return storageParser.parseAsync(JSON.parse(text));
  };

  const saveStorage = async (storage: ConfigStorage) => {
    const text = JSON.stringify(storage, null, 2);
    fs.writeFile(filePath, text, { encoding: 'utf8' });
  };

  // fs.exists deprecated and is not available in fs.promises
  const filePathExists = async () => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  const self = {
    createDefault: async (): Promise<void> => {
      if (await filePathExists())
        throw new Error(kleur.yellow(`${filePath} config file already exists`));

      saveStorage(defaultStorage);
    },

    availableNetworks: async (): Promise<string[]> => {
      const storage = await loadStorage();
      return Object.keys(storage.availableNetworks);
    },

    activeNetwork: async (): Promise<string> => {
      const storage = await loadStorage();
      return storage.activeNetwork;
    },

    setActiveNetwork: async (network: string): Promise<void> => {
      const storage = await loadStorage();

      if (!storage.availableNetworks[network])
        throw new Error(
          kleur.red(
            `network ${kleur.yellow(network)} is not available in configuration`
          )
        );

      storage.activeNetwork = network;
      saveStorage(storage);
    },

    load: async (network?: string): Promise<Config> => {
      const storage = await loadStorage();
      const usedNetwork = network ? network : storage.activeNetwork;
      return storage.availableNetworks[usedNetwork];
    },

    save: async (config: Config, network?: string) => {
      const storage = await loadStorage();
      const usedNetwork = network ? network : storage.activeNetwork;
      storage.availableNetworks[usedNetwork] = config;
      saveStorage(storage);
    }
  };

  return self;
};
