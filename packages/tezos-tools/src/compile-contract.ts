#!/usr/bin/env node

import { ligo } from './ligo';
import * as kleur from 'kleur';

const main = async () => {
  const ligoEnv = ligo();
  await ligoEnv.printLigoVersion();

  const [, , srcPath, contractMain, dstPath] = process.argv;

  if (!srcPath || !contractMain || !dstPath) {
    console.log(
      kleur.red(
        'required parameters are <source path>, <main function name>, <destination path>.'
      )
    );
    process.exit(-1);
  }

  await ligoEnv.compileContract(srcPath, contractMain, dstPath);
};

main();
