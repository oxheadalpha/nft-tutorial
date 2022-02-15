import { z } from 'zod';
import * as fs from 'fs';
import * as kleur from 'kleur';
import * as path from 'path';

const config = z
  .object({
    ligoDir: z.string(),
    compileOutDir: z.string(),
    tsSourceDir: z.string()
  })
  .strict();

export type Config = z.infer<typeof config>;

const parseConfig = (data: unknown): Config => config.parse(data);

const defaultFileName = 'tzgen.json';

export const configProvider = (fileName?: string) => {
  const name = fileName ? fileName : defaultFileName;
  const filePath = path.isAbsolute(name)
    ? name
    : path.join(process.cwd(), name);

  return {
    filePath,
    exists: (): boolean => fs.existsSync(filePath),
    load: (): Config => {
      const text = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
      return parseConfig(JSON.parse(text));
    },
    save: (config: Config) => {
      const text = JSON.stringify(config, null, 2);
      fs.writeFileSync(filePath, text, { encoding: 'utf8' });
    }
  };
};

export const initConfig = (ligo?: string, out?: string, ts?: string) => {
  const ligoDir = ligo || './ligo';
  const compileOutDir = out || './ligo/out';
  const tsSourceDir = ts || './src';

  const config = configProvider();
  if (config.exists()) {
    console.log(kleur.yellow(`${config.filePath} config file already exists`));
  } else {
    config.save({ ligoDir, compileOutDir, tsSourceDir });
    console.log(`${kleur.green(config.filePath)} config file created`);
  }
};
