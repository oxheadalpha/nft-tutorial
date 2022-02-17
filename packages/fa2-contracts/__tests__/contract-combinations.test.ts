import * as fs from 'fs';
import * as path from 'path';
import { sync as rimraf } from 'rimraf';
import { ligo } from '@oxheadalpha/tezos-tools';
import { generateFileContent } from '../src/contract-generator';
import { TezosToolkit } from '@taquito/taquito';
import { bootstrap } from './test-bootstrap';
import { generateStorage } from './generate-storage';
import { allCombinations } from './contract-modules-combination';

jest.setTimeout(500000);

describe('test compilation for contract module combinations', () => {
  const testSrcDir = './ligo/src';
  const ligoEnv = ligo();
  const contractFile = path.join(testSrcDir, 'fa2_contract.mligo');
  const outputFile = path.join(testSrcDir, 'fa2_contract.tz');
  let toolkit: TezosToolkit;
  let counter = 0;

  beforeAll(async () => {
    toolkit = await bootstrap();
  });

  beforeEach(() => {
    if (!fs.existsSync(testSrcDir)) fs.mkdirSync(testSrcDir);
  });

  test.each(allCombinations)(
    'a combination should compile %s %s %s %o',
    async (implementation, admin, minterAdmin, minter) => {
      //console.log(implementation, admin, minterAdmin, minter);
      console.log('CONTRACT TEST', ++counter);
      const param = {
        implementation,
        admin,
        minterAdmin,
        minter
      };
      const contractCode = generateFileContent(param);
      fs.writeFileSync(contractFile, contractCode);

      const code = await ligoEnv.compileAndLoadContract(
        contractFile,
        'asset_main',
        outputFile
      );
      const storage = generateStorage(param);

      const op = await toolkit.contract
        .originate({ code, storage })
        .catch(error => {
          console.error(error);
          console.log('STORAGE', storage);
          throw error;
        });
      if (op) await op.confirmation();

      rimraf(testSrcDir);
    }
  );
});
