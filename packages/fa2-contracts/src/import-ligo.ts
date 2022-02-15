import * as kleur from 'kleur';
import * as fs from 'fs';
import * as path from 'path';
import { configProvider } from './tzgen-config';

export const importLigo = (dir?: string) => {
  const destDir = resolveDestination(dir);
  const destPath = path.isAbsolute(destDir)
    ? destDir
    : path.resolve(process.cwd(), destDir);
  // __dirname is ./dist
  const srcPath = path.resolve(__dirname, '../ligo');

  console.log(`exporting LIGO sources from ${srcPath} to ${destPath}`);
  fs.cpSync(srcPath, destPath, { recursive: true, errorOnExist: true });
  console.log(kleur.green(`LIGO sources exported to ${destPath}`));
};

const resolveDestination = (dir?: string): string => {
  if (dir) {
    return dir;
  } else {
    const config = configProvider();
    if (!config.exists())
      throw new Error(`Destination directory argument is missing.
Either provide "dir" argument or create config file by running "tzgen init" command.`);
    return config.load().ligoDir;
  }
};
