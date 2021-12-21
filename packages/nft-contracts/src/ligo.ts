import * as fs from 'fs';
import * as path from 'path';
import * as child from 'child_process';
import * as kleur from 'kleur';

const ligoVersion = '0.31.0';
const ligoCmd = `docker run --rm -v "$PWD":"$PWD" -w "$PWD" ligolang/ligo:${ligoVersion} "$@"`;

const resolveFilePath = (cwd: string, filePath: string) =>
  path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);

const compileAndLoadContract =
  (cwd: string) =>
  async (srcFile: string, main: string, dstFile: string): Promise<string> => {
    const src = resolveFilePath(cwd, srcFile);
    const out = resolveFilePath(cwd, dstFile);
    await compileContractImpl(cwd, src, main, out);

    return new Promise<string>((resolve, reject) =>
      fs.readFile(out, (err, buff) =>
        err ? reject(err) : resolve(buff.toString())
      )
    );
  };

const compileContract =
  (cwd: string) =>
  async (srcFile: string, main: string, dstFile: string): Promise<void> => {
    const src = resolveFilePath(cwd, srcFile);
    const out = resolveFilePath(cwd, dstFile);
    return compileContractImpl(cwd, src, main, out);
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

const printLigoVersion = (cwd: string) => async () => {
  const cmd = `${ligoCmd} --version`;
  const output = await runCmd(cwd, cmd);
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

export const ligo = (cwd?: string) => {
  const cwd_ = cwd ? cwd : process.cwd();
  const fullCwd = path.resolve(cwd_);
  return {
    compileContract: compileContract(fullCwd),
    compileAndLoadContract: compileAndLoadContract(fullCwd),
    printLigoVersion: printLigoVersion(fullCwd)
  };
};
