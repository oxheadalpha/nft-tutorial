import * as path from 'path';
import * as fs from 'fs';
import * as kleur from 'kleur';
import { loadSpec } from './tzgen-spec';
import { loadConfig } from './tzgen-config';
import { ensureDirectory } from './utils';
import { generateTsInterfaceFileContent } from './ts-interface-generator';

export const generateTypeScript = (specFile: string, tsFile: string) => {
  const params = loadSpec(specFile);
  const tsFilePath = resolveTsFilePath(tsFile);
  ensureDirectory(tsFilePath);
  const code = generateTsInterfaceFileContent(params);
  fs.writeFileSync(tsFilePath, code);
  console.log(
    kleur.green(
      `contract interface source code file ${tsFilePath} is generated`
    )
  );
};

const resolveTsFilePath = (tsFileName: string): string => {
  const tsFile =
    path.extname(tsFileName) === '.ts' ? tsFileName : tsFileName + '.ts';
  const cfg = loadConfig();
  const filePath = path.join(cfg.tsSourceDir, tsFile);
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
};