import { promises as fs } from 'fs';
import * as kleur from 'kleur';
import * as path from 'path';

import { config as configParser, Config } from './parser';
import { defaultConfig } from './defaultConfig';

const defaultFileName = 'tznft.json';

export const config = (fileName?: string) => {
  const name = fileName ? fileName : defaultFileName;

  const filePath = path.isAbsolute(name)
    ? name
    : path.join(process.cwd(), name);

  const self = {
    exists: async (): Promise<boolean> => {
      // fs.exists deprecated and is not available in fs.promises
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    },

    createDefault: async (): Promise<void> => {
      if (await self.exists())
        throw new Error(kleur.yellow(`${filePath} config file already exists`));

      self.save(defaultConfig);
    },

    load: async (): Promise<Config> => {
      const text = await fs.readFile(filePath, { encoding: 'utf8', flag: 'r' });
      return configParser.parseAsync(JSON.parse(text));
    },

    save: async (config: Config) => {
      const parsedConfig = await configParser.parseAsync(config);
      const text = JSON.stringify(parsedConfig, null, 2);
      fs.writeFile(filePath, text, { encoding: 'utf8' });
    }
  };

  return self;
};
