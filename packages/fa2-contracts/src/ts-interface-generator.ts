import {
  Admin,
  ContractParam,
  Implementation,
  Minter,
  MinterAdmin
} from './contract-generator';
import CodeBlockWriter from 'code-block-writer';

export const generateTsInterfaceFileContent = (
  params: ContractParam
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
      withAdminStorageStatement(writer, params.admin);
      withImplementationStorageStatement(writer, params.implementation);
      writer.conditionalWriteLine(
        params.minter.has('CAN_FREEZE'),
        '.with(fa2.mintFreezeStorage)'
      );
      withMinterAdminStorageStatement(writer, params.minterAdmin);
      writer.write('.build;').blankLine();
    });
};

const addInterfaceFunction = (
  writer: CodeBlockWriter,
  params: ContractParam
) => {
  writer
    .writeLine('export const createContractInterface = async (')
    .indent(() => {
      writer.writeLine('toolkit: TezosToolkit,');
      writer.writeLine('address: address');
    })
    .writeLine(') =>')
    .indent(() => {
      writer.writeLine('(await tezosApi(toolkit).at(address))');
      writer.indent(() => {
        writer.writeLine('.withFa2()');
        withAdminInterfaceStatement(writer, params.admin);
        if (params.minter.size > 0) {
          withImplementationInterfaceStatement(writer, params.implementation);
          withMinterStatement(writer, params.minter);
          withMinterAdminInterfaceStatement(writer, params.minterAdmin);
        }
        writer.writeLine(';');
      });
    });
};

const withAdminStorageStatement = (writer: CodeBlockWriter, admin: Admin) => {
  switch (admin) {
    case 'USE_NO_ADMIN':
      return writer;
    case 'USE_SIMPLE_ADMIN':
      return writer.writeLine('.with(fa2.simpleAdminStorage)');
    case 'USE_PAUSABLE_SIMPLE_ADMIN':
      return writer.writeLine('.with(fa2.pausableSimpleAdminStorage)');
    case 'USE_MULTI_ADMIN':
      return writer.writeLine('.with(fa2.multiAdminStorage)');
  }
};

const withImplementationStorageStatement = (
  writer: CodeBlockWriter,
  implementation: Implementation
) => {
  switch (implementation) {
    case 'USE_NFT_TOKEN':
      return writer.writeLine('.with(fa2.nftStorage)');
    case 'USE_FUNGIBLE_TOKEN':
      return writer.writeLine('.with(fa2.fungibleTokenStorage)');
    case 'USE_MULTI_FUNGIBLE_TOKEN':
      return writer.writeLine('.with(fa2.multiFungibleTokenStorage)');
  }
};

const withMinterStatement = (writer: CodeBlockWriter, minter: Set<Minter>) => {
  writer.conditionalWriteLine(minter.has('CAN_MINT'), '.withMint()');
  writer.conditionalWriteLine(minter.has('CAN_BURN'), '.withBurn()');
  writer.conditionalWriteLine(minter.has('CAN_FREEZE'), '.withFreeze()');
};

const withMinterAdminStorageStatement = (
  writer: CodeBlockWriter,
  minterAdmin: MinterAdmin
) => {
  switch (minterAdmin) {
    case 'USE_NULL_MINTER_ADMIN':
      return writer;
    case 'USE_ADMIN_AS_MINTER':
      return writer;
    case 'USE_MULTI_MINTER_ADMIN':
      return writer.writeLine('.with(fa2.multiMinterAdminStorage)');
  }
};

const withAdminInterfaceStatement = (writer: CodeBlockWriter, admin: Admin) => {
  switch (admin) {
    case 'USE_NO_ADMIN':
      return writer;
    case 'USE_SIMPLE_ADMIN':
      return writer.writeLine('.withSimpleAdmin()');
    case 'USE_PAUSABLE_SIMPLE_ADMIN':
      return writer.writeLine('.withPausableSimpleAdmin()');
    case 'USE_MULTI_ADMIN':
      return writer.writeLine('.withMultiAdminStorage())');
  }
};

const withImplementationInterfaceStatement = (
  writer: CodeBlockWriter,
  implementation: Implementation
) => {
  switch (implementation) {
    case 'USE_NFT_TOKEN':
      return writer.writeLine('.asNft()');
    case 'USE_FUNGIBLE_TOKEN':
      return writer.writeLine('.asFungibleToken()');
    case 'USE_MULTI_FUNGIBLE_TOKEN':
      return writer.writeLine('.asMultiFungibleToken())');
  }
};

const withMinterAdminInterfaceStatement = (
  writer: CodeBlockWriter,
  minterAdmin: MinterAdmin
) => {
  switch (minterAdmin) {
    case 'USE_NULL_MINTER_ADMIN':
      return writer;
    case 'USE_ADMIN_AS_MINTER':
      return writer;
    case 'USE_MULTI_MINTER_ADMIN':
      return writer.writeLine('.withMultiMinterAdmin()');
  }
};
