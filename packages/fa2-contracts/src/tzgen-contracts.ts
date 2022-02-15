import * as path from 'path';
import * as fs from 'fs';
import * as kleur from 'kleur';
import { ContractParam, generateFileContent } from './contract-generator';
import { specProvider } from './tzgen-spec';
import { configProvider } from './tzgen-config';

export const generateContract = (specFile: string, ligoName: string) => {
  const params = loadSpec(specFile);
  const ligoFilePath = resolveLigoFilePath(ligoName);
  const code = generateFileContent(params);
  ensureDirectory(ligoFilePath);
  fs.writeFileSync(ligoFilePath, code);
  console.log(
    kleur.green(`contract source code file ${ligoFilePath} is generated`)
  );
};

const loadSpec = (specFile: string): ContractParam => {
  const spec = specProvider(specFile);
  if (!spec.exists()) throw new Error(`${specFile} spec file does not exist`);
  return spec.load();
};

const resolveLigoFilePath = (ligoName: string): string => {
  const ligoFile =
    path.extname(ligoName) === '.mligo' ? ligoName : ligoName + '.mligo';
  const cfg = configProvider().load();
  const filePath = path.join(cfg.ligoDir, './src', ligoFile);
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
};

const ensureDirectory = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (fs.existsSync(dir)) return;
  fs.mkdirSync(dir, { recursive: true });
};
