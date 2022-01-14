import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  testMatch: ['**/__tests__/*.+(spec|test).[jt]s?(x)'],
  verbose: true,
  preset: 'ts-jest'
};
export default config;