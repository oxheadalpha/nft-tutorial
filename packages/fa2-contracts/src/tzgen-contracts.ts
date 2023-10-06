import * as path from 'path';
import * as fs from 'fs';
import * as kleur from 'kleur';
import { generateFileContent } from './contract-generator';
import { ensureDirectory } from './utils';
import { loadSpec } from './tzgen-spec';
import { loadConfig } from './tzgen-config';
import { ligo } from '@oxheadalpha/tezos-tools';

export const compileContract = async (
  contractFile: string,
  michelsonFile: string,
  main?: string
) => {
  const ligoFilePath = resolveLigoFilePath(contractFile);
  if (!fs.existsSync(ligoFilePath))
    throw new Error(`Contract LIGO source file ${ligoFilePath} does not exist`);
  const michelsonFilePath = resolveMichelsonFilePath(michelsonFile);
  ensureDirectory(michelsonFilePath);
  const mainEntrypoint = main ? main : 'Asset';
  const ligoEnv = ligo();
  await ligoEnv.printLigoVersion();
  await ligoEnv.compileContract(
    ligoFilePath,
    mainEntrypoint,
    michelsonFilePath
  );
  console.log(
    kleur.yellow(`compiled contract to ${kleur.green(michelsonFilePath)} file`)
  );
};

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

const resolveLigoFilePath = (ligoName: string): string => {
  const ligoFile =
    path.extname(ligoName) === '.mligo' ? ligoName : ligoName + '.mligo';
  const cfg = loadConfig();
  const filePath = path.join(cfg.ligoDir, './src', ligoFile);
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
};

const resolveMichelsonFilePath = (michelsonName: string): string => {
  const michelsonFile = path.extname(michelsonName)
    ? michelsonName
    : michelsonName + '.tz';
  const cfg = loadConfig();
  const filePath = path.join(cfg.compileOutDir, michelsonFile);
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
};
