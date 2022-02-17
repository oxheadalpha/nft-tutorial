#!/usr/bin/env node
import { Option, program } from 'commander';
import * as kleur from 'kleur';
import { TezosOperationError } from '@taquito/taquito';
import { initConfig } from './tzgen-config';
import { createGenSpec } from './tzgen-spec';
import { compileContract, generateContract } from './tzgen-contracts';
import { importLigo } from './import-ligo';
import { generateTypeScript } from './tzgen-ts';
const packageJson = require('../package.json');

program.version(packageJson.version);

//prettier-ignore
program
  .command('init')
  .alias('i')
  .description('create tzgen.json file with the generator environment settings')
  .option('-l --ligo <ligo>', 'ligo code directory. Default is ./ligo')
  .option('-o --compile_out <out>', 'contract compilation output directory. Default is ./ligo/out')
  .option('-t --ts <ts>', 'TypeScript source directory. Default is ./src')
  .action(async options => initConfig(options.ligo, options.compile_out, options.ts));

//prettier-ignore
program
  .command('import-ligo')
  .alias('il')
  .description('import LIGO modules source code')
  .argument('[dir]', 'destination directory. Default is taken from tzgen.json file')
  .action(importLigo);

//prettier-ignore
program
  .command('spec')
  .alias('s')
  .description('generate specification file for contract generation')
  .argument('<file>', 'resulting specification file')
  .addOption(new Option('-k --kind <kind>', 'core FA2 implementation kind')
    .makeOptionMandatory()
    .choices(['NFT', 'FT', 'MFT']))
  .addOption(new Option('-a --admin <admin>', 'type of contract admin')
    .makeOptionMandatory()
    .choices(['NO_ADMIN', 'SIMPLE', 'PAUSABLE', 'MULTI']))
  .addOption(new Option('-m --minter [minter...]', 'optional minter functionality')
    .choices(['MINT', 'BURN', 'FREEZE']))
  .addOption(new Option('-ma --minter_admin <minter_admin>', 'minter admin implementation' )
    .choices(['NO_MINTER', 'CONTRACT_ADMIN', 'MULTI'])
    .default('NO_MINTER', 'NO_MINTER useful if not mint/burn functionality is specified')
  )
  .action((file, options) => createGenSpec(
    file, options.kind, options.admin, options.minter, options.minter_admin
  ));

//prettier-ignore
program
  .command('contract')
  .alias('c')
  .description('generate LIGO contract source code from the specification file')
  .argument('<spec_file>', 'specification file')
  .argument('<contract_file>', 'name of the LIGO source file to be generated')
  .action(generateContract);

//prettier-ignore
program
  .command('michelson')
  .alias('m')
  .description('compile LIGO contract code to Michelson')
  .argument('<contract_file>', 'name of the LIGO contract source file')
  .argument('<michelson_file>', 'name of the Michelson code file to be compiled')
  .option('-m --main', 'name of the contract main entry point function. Default is "asset_main"')
  .action((contractFile, michelsonFile, options) => compileContract(
    contractFile, michelsonFile, options.main
  ));

//prettier-ignore
program
  .command('type-script')
  .alias('ts')
  .description('generate typescript interface')
  .argument('<spec_file>', 'specification file')
  .argument('<interface_file>', 'name of the TypeScript source file to be generated')
  .action(generateTypeScript);

program.parseAsync().catch(error => {
  if (typeof error === 'string') console.log(kleur.red(error));
  else if (error instanceof Error) {
    console.log(kleur.red(error.message));
  } else if (error instanceof TezosOperationError) {
    console.log(
      kleur.red(`Tezos operation error: ${kleur.bold(error.message)}`)
    );
  } else {
    console.log(kleur.red('unknown error:'));
    console.log(error);
  }
});
