import { ZodError } from 'zod';
import { promises as fs } from 'fs';

import {
  loadConfig,
  initConfig,
  Config,
  activeNetwork,
  saveConfig
} from '../src/config';

describe('tznft configuration tests', () => {
  let config: Config;

  beforeAll(async () => {
    await initConfig();
  });

  afterAll(async () => {
    fs.unlink('./tznft.json');
  });

  test('Test successful reading and writing config.', async () => {
    let c = await loadConfig();

    const alias = {
      address: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU'
    };

    activeNetwork(c).aliases['test'] = alias;

    await saveConfig(c);
    c = await loadConfig();

    expect(activeNetwork(c).aliases['test']).toMatchObject(alias);
  });

  test('Test failure when reading config with an invalid address.', async () => {
    let c = await loadConfig();

    const alias = {
      address: 'tzInvalid'
    };

    activeNetwork(c).aliases['test'] = alias;

    await saveConfig(c);
    await expect(loadConfig()).rejects.toThrow(ZodError);
  });
});
