#!/usr/bin/env node
import { program } from 'commander';
import * as kleur from 'kleur';
import { TezosOperationError } from '@taquito/taquito';
import { initConfig } from './tzgen-config';
const packageJson = require('../package.json');

program.version(packageJson.version);

//prettier-ignore
program
  .command('init')
  .alias('i')
  .description('create tzgen.json file with the generator environment settings')
  .option('-l --ligo', 'ligo code directory')
  .option('-o --compile-out', 'contract compilation output directory')
  .option('-t --ts', 'TypeScript source directory')
  .action(async options => initConfig(options.ligo, options.out, options.ts));

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
