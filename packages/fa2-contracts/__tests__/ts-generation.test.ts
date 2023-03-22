import * as fs from 'fs';
import * as child from 'child_process';

import { allCombinations } from './contract-modules-combination';
import { generateTsInterfaceFileContent } from '../src/ts-interface-generator';

jest.setTimeout(500000);

describe('generate TypeScript interface', () => {
  let counter = 0;

  test.each(allCombinations)(
    'generated ts file compiles',
    async (implementation, admin, minterAdmin, minter) => {
      console.log('TS INTERFACE TEST', ++counter);

      const params = {
        implementation,
        admin,
        minterAdmin,
        minter
      };
      const code = generateTsInterfaceFileContent(params);
      const fileName = './src/test.ts';
      fs.writeFileSync(fileName, code);
      // ./src/test.ts is configured in tsconfig.test.generated.json
      await compileFile();
      fs.unlinkSync(fileName);
    }
  );
});

/**
 * Compiles ./src/test.ts file configured in tsconfig.test.generated.json
 */
const compileFile = async (): Promise<string> =>
  new Promise<string>((resolve, reject) =>
    child.exec(
      `yarn tsc -p tsconfig.test.generated.json --noEmit`,
      {},
      (err, stdout, errout) => {
        if (errout || err) {
          console.log(`Compilation error ${errout} ${stdout}`);
          reject(err?.message + '\n' + stdout);
        } else {
          resolve(stdout);
        }
      }
    )
  );
