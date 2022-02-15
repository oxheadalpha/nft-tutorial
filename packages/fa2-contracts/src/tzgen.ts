#!/usr/bin/env node
import { Option, program } from 'commander';
import * as kleur from 'kleur';
import { TezosOperationError } from '@taquito/taquito';
import { initConfig } from './tzgen-config';
import { createGenSpec } from './tzgen-spec';
const packageJson = require('../package.json');

program.version(packageJson.version);

//prettier-ignore
program
  .command('init')
  .alias('i')
  .description('create tzgen.json file with the generator environment settings')
  .option('-l --ligo', 'ligo code directory. Default is ./ligo')
  .option('-o --compile-out', 'contract compilation output directory. Default is ./ligo/out')
  .option('-t --ts', 'TypeScript source directory. Default is ./src')
  .action(async options => initConfig(options.ligo, options.out, options.ts));

//prettier-ignore
program
  .command('spec')
  .alias('s')
  .description('create specification file for contract generation')
  .argument('<file>', 'resulting specification file')
  .addOption(new Option('-k --kind <kind>', 'core FA2 implementation kind')
    .makeOptionMandatory()
    .choices(['NFT', 'FT', 'MFT']))
  .addOption(new Option('-a --admin <admin>', 'type of contract admin')
    .makeOptionMandatory()
    .choices(['NO_ADMIN', 'SIMPLE', 'PAUSABLE', 'MULTI']))
  .addOption(new Option('-m --minter <minter...>', 'optional minter functionality')
    .choices(['MINT', 'BURN', 'FREEZE']))
  .addOption(new Option('-ma --minter_admin <minter_admin>', 'minter admin implementation' )
    .choices(['NO_ADMIN', 'CONTRACT_ADMIN', 'MULTI']))
  .action((file, options) => createGenSpec(
    file, options.kind, options.admin, options.minter, options.minter_admin));

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
