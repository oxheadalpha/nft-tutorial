import * as fs from 'fs';
import * as path from 'path';
import * as child from 'child_process';
import * as kleur from 'kleur';
import { TezosToolkit } from '@taquito/taquito';
import { Contract } from '@oxheadalpha/fa2-interfaces';

const ligoVersion = '0.31.0';
const ligoCmd = `docker run --rm -v "$PWD":"$PWD" -w "$PWD" ligolang/ligo:${ligoVersion} "$@"`;

export class LigoEnv {
  readonly cwd: string;
  readonly srcDir: string;
  readonly outDir: string;

  constructor(cwd: string, srcDir: string, outDir: string) {
    this.cwd = cwd;
    this.srcDir = srcDir;
    this.outDir = outDir;
  }

  srcFilePath(srcFileName: string): string {
    return path.join(this.srcDir, srcFileName);
  }

  outFilePath(outFileName: string): string {
    return path.join(this.outDir, outFileName);
  }
}

export const defaultLigoEnv = (
  cwd: string,
  ligoDir: string = 'ligo'
): LigoEnv => {
  const src = path.join(ligoDir, 'src');
  const out = path.join(ligoDir, 'out');
  return new LigoEnv(path.resolve(cwd), path.resolve(src), path.resolve(out));
};

export const defaultLigoEnv2 = (): LigoEnv => {
  const src = 'src/ligo';
  const out = 'src/ligo/out';
  return new LigoEnv('.', src, out);
};

export const compileAndLoadContract = async (
  env: LigoEnv,
  srcFile: string,
  main: string,
  dstFile: string
): Promise<string> => {
  const src = env.srcFilePath(srcFile);
  const out = env.outFilePath(dstFile);
  await compileContractImpl(env.cwd, src, main, out);

  return new Promise<string>((resolve, reject) =>
    fs.readFile(out, (err, buff) =>
      err ? reject(err) : resolve(buff.toString())
    )
  );
};

export const compileContract = async (
  env: LigoEnv,
  srcFile: string,
  main: string,
  dstFile: string
): Promise<void> => {
  const src = env.srcFilePath(srcFile);
  const out = env.outFilePath(dstFile);
  return compileContractImpl(env.cwd, src, main, out);
};

const compileContractImpl = async (
  cwd: string,
  srcFilePath: string,
  main: string,
  dstFilePath: string
): Promise<void> => {
  const cmd = `${ligoCmd} compile contract ${srcFilePath} -e ${main} -o ${dstFilePath}`;
  await runCmd(cwd, cmd);
};

export const compileExpression = async (
  env: LigoEnv,
  srcFile: string,
  expression: string
): Promise<string> => {
  const srcFilePath = env.srcFilePath(srcFile);
  const cmd = `${ligoCmd} compile expression '${expression}' --init-file ${srcFilePath}`;
  return runCmd(env.cwd, cmd);
};

export const printLigoVersion = async (env: LigoEnv) => {
  const cmd = `${ligoCmd} --version`;
  const output = await runCmd(env.cwd, cmd);
  console.log(kleur.green(`ligo version ${output}`));
};

const runCmd = (cwd: string, cmd: string): Promise<string> => {
  return new Promise<string>((resolve, reject) =>
    child.exec(cmd, { cwd }, (err, stdout, errout) => {
      if (stdout && (errout || err)) {
        console.log(kleur.green(stdout));
      }
      if (errout) {
        console.log(kleur.red(errout));
      }
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    })
  );
};

export const originateContract = async (
  tz: TezosToolkit,
  code: string,
  storage: any,
  name: string
): Promise<Contract> => {
  try {
    const originationOp = await tz.contract.originate({
      code,
      init: storage
    });
    const contract = await originationOp.contract();
    console.log(
      kleur.green(
        `originated contract ${name} with address ${contract.address}`
      )
    );
    console.log(kleur.green(`consumed gas: ${originationOp.consumedGas}`));
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    console.log(kleur.red(`${name} origination error ${jsonError}`));
    return Promise.reject(error);
  }
};
