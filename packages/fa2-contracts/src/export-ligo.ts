#!/usr/bin/env node

import * as kleur from 'kleur';
import * as fs from 'fs';
import * as path from 'path';

const [, , destPath] = process.argv;

if (!destPath) {
  console.log(kleur.red('destination path argument is missing.'));
  process.exit(-1);
}

// if(!fs.existsSync(destPath)) {
//   console.log(kleur.red(`Export destination path ${destPath} does not exist.`));
//   process.exit(-1);
// }

const fullDestPath = path.isAbsolute(destPath)
  ? destPath
  : path.join(process.cwd(), destPath);

// __dirname is ./dist
const fullSrcPath = path.resolve(__dirname, '../ligo');

console.log(`Exporting Ligo library from ${fullSrcPath} to ${fullDestPath}`);
fs.cpSync(fullSrcPath, destPath, { recursive: true, errorOnExist: true });
console.log(kleur.green(`Ligo library exported to ${fullDestPath}`));
