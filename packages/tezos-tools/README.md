# Description

TypeScript API for

* [LIGO](https://ligolang.org/) contract compilation.

* Interaction with [Flextesa](https://tezos.gitlab.io/flextesa/) sandbox (using
  docker images).

* Pinning files and directories to Pinata IPFS.

* Generate Tezos keys.

## Scripts

`start-sandbox` starts Flextesa sandbox.

Example:

```sh
$ yarn start-sandbox
```

`kill-sandbox` kills running Flextesa sandbox.

Example:

```sh
$ yarn kill-sandbox
```

`compile-contract <source_ligo_file> <entry_points_function> <output_michelson_file>`
compiles a ligo contract to Michelson. This script is an equivalent of
`ligo compile contract <source_ligo_file> -e <entry_points_function> -o <output_michelson_file>`.

Example:

```sh
$ yarn compile-contract ligo/examples/fa2_asset_use_example.mligo  asset_main fa2_asset.tz
```


`gen-keys` generates a pair of a new secret key and public key hash (tz address).

Example:

```sh
$ yarn gen-keys
{
  pkh: 'tz1cxxQ75tknhruvyweB1tndLD4r1EkvCfMA',
  secret: 'edsk3gCeSu8F1vGuJYWrxHCN2nvYgSn3wTRJmFSwG1TgWSEJWrCLv4'
}
```

## API

### Ligo

```typescript
/**
 * Create Ligo compiler API
 * @param cwd working directory to run Ligo commands
 * @returns Ligo object with Typescript API for Ligo compiler
 */
function ligo(cwd?: string): Ligo
```

```typescript
/**
 * TypeScript interface to Ligo commands
 */
export interface Ligo {
  /**
   * Compile contract from Ligo language to Michelson
   * @param srcFile path to the contract source file
   * @param main name of the main entry point function for the contract
   * @param dstFile path to the compiled contract resulting file
   */
  compileContract(
    srcFile: string,
    main: string,
    dstFile: string
  ): Promise<void>;
  /**
   * Compile contract from Ligo language to Michelson and loads Michelson code
   * @param srcFile path to the contract source file
   * @param main name of the main entry point function for the contract
   * @param dstFile path to the compiled contract resulting file
   * @returns compiled Michelson code of the contract
   */
  compileAndLoadContract(
    srcFile: string,
    main: string,
    dstFile: string
  ): Promise<string>;
  /**
   * Print to console current Ligo compiler version
   */
  printLigoVersion(): Promise<void>;
}
```

Usage example:

```typescript
import { ligo } from '@oxheadalpha/tezos-tools';

const main = async () => {
  const ligoEnv = ligo();
  await ligoEnv.printLigoVersion();

  await ligoEnv.compileContract(
    './ligo/src/fa2_nft_asset.mligo',
    'nft_asset_main',
    './dist/fa2_nft_asset.tz'
  );
};
```

### Flextesa

```typescript
/**
 * Start a new instance of Flextesa sandbox.
 * Sandbox node RPC will be available at 'http://localhost:20000'.
 */
async function startSandbox(): Promise<void>
```

```typescript
/**
 * Kill running Flextesa sandbox.
 */
async function killSandbox(): Promise<void> 
```

```typescript
/**
 * Await until sandbox (or other node) is bootstrapped and available.
 * @param toolkit - toolkit which connects to sandbox RPC.
 */
async function awaitForSandbox(toolkit: TezosToolkit): Promise<void>
```

Usage example:

```typescript
import {
  startSandbox,
  killSandbox,
  awaitForSandbox
} from '@oxheadalpha/tezos-tools';

if (network === 'sandbox') {
  await startSandbox();
  await awaitForNetwork(toolkit);

  await runBlockchainTasks(toolkit);

  await killSandbox();
}
```

### Originate Contract

```typescript
/**
 * Originate a contract on blockchain
 * @param tz toolkit pointing to a blockchain node RPC. Must be initialized with
 * a signer; Signer will pay origination fees.
 * @param code Michelson code of the contract
 * @param storage initial storage of the contract. Storage can be either Michelson
 * string or TypeScript object
 * @param name name of the contract for logging
 * @returns Taquito contract proxy object
 */
async function originateContract(
  tz: TezosToolkit,
  code: string,
  storage: string | object,
  name: string
): Promise<Contract>
```

Usage example:

```typescript
import { originateContract } from '@oxheadalpha/tezos-tools';

const contract = await originateContract(tz, code, storage, 'nft');
return contract.address;
```

### Generate Tezos Keys

``` typescript
/**
 * @param keyType prefix to append to a generated key. The default value is 'edsk2'
 * @returns `{pkh, secret}` where `pkh` if a public key hash (tz address) and
 * `secret` is a secret key.
 */
async function newKeys(): Promise<{pkh, secret}>
```

Usage example:

```typescript
  import { newKeys } from '@oxheadalpha/tezos-tools';
  const {pkh, secret} = await newKeys();
```

### Pinata IPFS

```typescript
/**
 * Pin local file to IPFS using Pinata API
 * @param apiKey Pinata account API key
 * @param secretKey Pinata account secret key
 * @param name pinned file name on IPFS
 * @param filePath path to a local file to be pinned
 * @returns IPFS hash (CID) for a pinned file
 */
async function pinFile(
  apiKey: string,
  secretKey: string,
  name: string,
  filePath: string
): Promise<string>
```

```typescript
/**
 * Pin local directory to IPFS using Pinata API
 * @param apiKey Pinata account API key
 * @param secretKey Pinata account secret key
 * @param name pinned directory name on IPFS
 * @param dirPath path to a local directory to be pinned
 * @returns IPFS hash (CID) for a pinned directory
 */
export async function pinDirectory(
  apiKey: string,
  secretKey: string,
  name: string,
  dirPath: string
): Promise<string>
```

Usage example:

```typescript
import { pinFile, pinDirectory } from '@oxheadalpha/tezos-tools';

const cid = await pinFile(
  pinataKeys.apiKey,
  pinataKeys.secretKey,
  tag,
  resolvedPath
);

console.log(`ipfs://${cid}`);
```
