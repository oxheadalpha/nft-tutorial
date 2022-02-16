import * as path from 'path';
import * as fs from 'fs';
import * as kleur from 'kleur';
import { loadSpec } from './tzgen-spec';
import { loadConfig } from './tzgen-config';
import { ensureDirectory } from './utils';
import { ContractParam } from './contract-generator';
import CodeBlockWriter from 'code-block-writer';

export const generateTypeScript = (specFile: string, tsFile: string) => {
  const params = loadSpec(specFile);
  const tsFilePath = resolveTsFilePath(tsFile);
  ensureDirectory(tsFilePath);
  const code = generateFileContent(params, tsFilePath);
  fs.writeFileSync(tsFilePath, code);
  console.log(
    kleur.green(
      `contract interface source code file ${tsFilePath} is generated`
    )
  );
};

const generateFileContent = (
  params: ContractParam,
  filePath: string
): string => {
  const writer = new CodeBlockWriter({
    indentNumberOfSpaces: 2,
    useSingleQuote: true
  });

  addImports(writer);
  addStorageFunction(writer, params);
  addInterfaceFunction(writer, params);

  return writer.toString();
};

const addImports = (writer: CodeBlockWriter) => {
  writer
    .writeLine(`import { TezosToolkit } from '@taquito/taquito';`)
    .writeLine(`import * as fa2 from '@oxheadalpha/fa2-interfaces';`)
    .writeLine(
      `import { address, tezosApi } from '@oxheadalpha/fa2-interfaces';`
    )
    .blankLine();
};

const addStorageFunction = (writer: CodeBlockWriter, params: ContractParam) => {
  writer
    .writeLine('export const createStorage = fa2.contractStorage')
    .indent(() => {
      switch (params.admin) {
        case 'USE_NO_ADMIN':
          break;
        case 'USE_SIMPLE_ADMIN':
          writer.writeLine('.with(fa2.simpleAdminStorage)');
          break;
        case 'USE_PAUSABLE_SIMPLE_ADMIN':
          writer.writeLine('.with(fa2.pausableSimpleAdminStorage)');
          break;
        case 'USE_MULTI_ADMIN':
          writer.writeLine('.with(fa2.multiAdminStorage)');
          break;
      }

      switch (params.implementation) {
        case 'USE_NFT_TOKEN':
          writer.writeLine('.with(fa2.nftStorage)');
          break;
        case 'USE_FUNGIBLE_TOKEN':
          writer.writeLine('.with(fa2.fungibleTokenStorage)');
          break;
        case 'USE_MULTI_FUNGIBLE_TOKEN':
          writer.writeLine('.with(fa2.multiFungibleTokenStorage)');
          break;
      }

      writer.conditionalWriteLine(
        params.minter.has('CAN_FREEZE'),
        '.with(fa2.mintFreezeStorage)'
      );

      switch (params.minterAdmin) {
        case 'USE_NULL_MINTER_ADMIN':
          break;
        case 'USE_ADMIN_AS_MINTER':
          break;
        case 'USE_MULTI_MINTER_ADMIN':
          writer.writeLine('.with(fa2.multiMinterAdminStorage)');
          break;
      }

      writer.write('.build;').blankLine();
    });
};

const addInterfaceFunction = (
  writer: CodeBlockWriter,
  params: ContractParam
) => {};

const resolveTsFilePath = (tsFileName: string): string => {
  const tsFile =
    path.extname(tsFileName) === '.ts' ? tsFileName : tsFileName + '.ts';
  const cfg = loadConfig();
  const filePath = path.join(cfg.tsSourceDir, tsFile);
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
};
