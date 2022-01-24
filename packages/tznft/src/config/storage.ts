import { promises as fs } from 'fs';
import {
  configStorage as storageParser,
  Config,
  ConfigStorage
} from './parser';
import { defaultStorage } from './defaultStorage';

export const configStorage = (fileName: string) => {
  const loadStorage = async () => {
    const text = await fs.readFile(fileName, { encoding: 'utf8', flag: 'r' });
    return storageParser.parseAsync(text);
  };

  const saveStorage = async (storage: ConfigStorage) => {
    const text = JSON.stringify(storage);
    fs.writeFile(fileName, text, { encoding: 'utf8' });
  };

  const self = {
    createDefault: async () => {
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
        throw new Error(`Trying to set an invalid network: ${network}`);

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

      if (!storage.availableNetworks[usedNetwork])
        throw new Error(
          `Trying to write config into an invalid network: ${usedNetwork}`
        );

      storage.availableNetworks[usedNetwork] = config;
      saveStorage(storage);
    }
  };

  return self;
};
