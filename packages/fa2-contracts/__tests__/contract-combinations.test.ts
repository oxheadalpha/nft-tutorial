import * as fs from 'fs';
import * as path from 'path';
import { ligo } from '@oxheadalpha/tezos-tools';
import {
  Admin,
  generateFileContent,
  Implementation,
  Minter,
  MinterAdmin
} from '../src/contract-generator';
import { TezosToolkit } from '@taquito/taquito';
import { bootstrap } from './test-bootstrap';
import { generateStorage } from './generate-storage';

const implementations: Implementation[] = [
  'USE_NFT_TOKEN',
  'USE_FUNGIBLE_TOKEN',
  'USE_MULTI_FUNGIBLE_TOKEN'
];

const admins: Admin[] = [
  'USE_NO_ADMIN',
  'USE_SIMPLE_ADMIN',
  'USE_PAUSABLE_SIMPLE_ADMIN',
  'USE_MULTI_ADMIN'
];

const minterAdmins: MinterAdmin[] = [
  'USE_NULL_MINTER_ADMIN',
  'USE_ADMIN_AS_MINTER',
  'USE_MULTI_MINTER_ADMIN'
];

const minters: Set<Minter>[] = [
  new Set(),
  new Set(['CAN_MINT']),
  new Set(['CAN_BURN']),
  new Set(['CAN_MINT', 'CAN_BURN']),
  new Set(['CAN_MINT', 'CAN_FREEZE']),
  new Set(['CAN_BURN', 'CAN_FREEZE']),
  new Set(['CAN_MINT', 'CAN_BURN', 'CAN_FREEZE'])
];

function* combinations(): Generator<
  [Implementation, Admin, MinterAdmin, Set<Minter>]
> {
  for (let impl of implementations)
    for (let admin of admins)
      for (let minterAdmin of minterAdmins)
        for (let minter of minters) yield [impl, admin, minterAdmin, minter];
}

const singleCombination: [Implementation, Admin, MinterAdmin, Set<Minter>] = [
  'USE_MULTI_FUNGIBLE_TOKEN',
  'USE_MULTI_ADMIN',
  'USE_MULTI_MINTER_ADMIN',
  new Set()
];

jest.setTimeout(500000);

describe('test compilation for contract module combinations', () => {
  const testDir = './__tests__/';
  const ligoEnv = ligo();
  const contractFile = path.join(testDir, 'fa2_contract.mligo');
  let toolkit: TezosToolkit;
  let counter = 0;

  beforeAll(async () => {
    toolkit = await bootstrap();
  });

  test.each([...combinations()])(
    // test.each([singleCombination])(
    'a combination should compile %s %s %s %o',
    async (implementation, admin, minterAdmin, minter) => {
      //console.log(implementation, admin, minterAdmin, minter);
      const param = {
        implementation,
        admin,
        minterAdmin,
        minter
      };
      const contractCode = generateFileContent(param);
      fs.writeFileSync(contractFile, contractCode);

      const outputFile = path.join(testDir, 'fa2_contract.tz');

      const code = await ligoEnv.compileAndLoadContract(
        contractFile,
        'asset_main',
        outputFile
      );
      const storage = generateStorage(param);

      const op = await toolkit.contract.originate({code, storage});
      await op.confirmation();

      fs.unlinkSync(contractFile);
      fs.unlinkSync(outputFile);
      console.log('TEST', ++counter)
    }
  );
});
