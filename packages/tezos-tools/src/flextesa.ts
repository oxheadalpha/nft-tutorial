import * as child from 'child_process';
import * as kleur from 'kleur';
import retry from 'async-retry';
import { TezosToolkit } from '@taquito/taquito';

/**
 * Start a new instance of Flextesa sandbox.
 * Sandbox node RPC will be available at 'http://localhost:20000'.
 */
export const startSandbox = async (): Promise<void> => {
  await new Promise<void>((resolve, reject) =>
    //start and wait
    child.exec(
      'sh ../flextesa/start-sandbox.sh',
      { cwd: __dirname },
      (err, stdout, errout) => {
        if (err) {
          console.log(kleur.red('failed to start sandbox'));
          console.log(kleur.red().dim(errout));
          reject();
        } else {
          console.log(kleur.yellow().dim(stdout));
          resolve();
        }
      }
    )
  );
};

/**
 * Kill running Flextesa sandbox.
 */
export const killSandbox = async (): Promise<void> => {
  await new Promise<void>((resolve, reject) =>
    child.exec(
      'sh ../flextesa/kill-sandbox.sh',
      { cwd: __dirname },
      (err, stdout, errout) => {
        if (err) {
          console.log(kleur.red('failed to stop sandbox'));
          console.log(kleur.red().dim(errout));
          reject(err);
        } else {
          console.log(kleur.yellow().dim(stdout));
          resolve();
        }
      }
    )
  );
  console.log(kleur.yellow('killed sandbox.'));
};

/**
 * Await until sandbox (or other node) is bootstrapped and available.
 * @param toolkit - toolkit which connects to sandbox RPC.
 */
export const awaitForSandbox = async (toolkit: TezosToolkit): Promise<void> =>
  retry(
    async () => {
      console.log('connecting to Tezos node rpc...');
      await toolkit.rpc.getBlockHeader({ block: '2' });
    },
    { retries: 8 }
  );
