# Content

[LIGO](https://ligolang.org/) library of reusable modules to implement FA2
contracts.

## Table of Contents

* [Modular Contracts](#modular-contracts)
  * [Token Kind](#token-kind)
  * [Minter Functionality](#minter-functionality)
  * [Contract Admin](#contract-admin)
  * [Minter Admin](#minter-admin)
  * [Contract Specification Example](#contract-specification-example)
* [tzGen CLI Tool](#tzgen-cli-tool)
  * [Initial Setup](#initial-setup)
  * [Import LIGO Code](#import-ligo-code)
  * [Initialize tzGen Environment](#initialioze-tzgen-environment)
  * [Create FA2 Contract Specification](#create-fa2-contract-specification)
  * [Generate LIGO Code](#generate-ligo-code)
  * [Generate Michelson Code](#generate-michelson-code)
  * [Generate TypeScript Code](#generate-typescript-code)
* [Programmatic API](#programmatic-api)
  * [Implementation Combinator](#implementation-combinator)
  * [Contract Admin Combinator](#contract-admin-combinator)
  * [Token Minter Combinator](#token-minter-combinator)
  * [Minter Admin Combinator](#minter-admin-combinator)
  * [Generate Contract Code](#generate-contract-code)
* [CameLigo Modules](#cameligo-modules)
  * [Common LIGO Admin Module Signature](#common-ligo-admin-module-signature)
  * [Common LIGO Minter Admin Module Signature](#common-ligo-minter-admin-module-signature)

## Modular Contracts

The FA2 interface is designed to support a wide range of token kinds and
implementations. The developer has to choose from multiple options when
implementing a specific FA2 contract. Besides choosing between fungible and
non-fungible tokens, a developer needs to decide whether new tokens can be
minted and burned, how the contract administrators can be set, and what entry
points should have admin access only.

This package provides reusable contract modules implemented in the
[CameLIGO](https://ligolang.org/) language that can be composed into a single
FA2 contract. The developer can use either the [tzGen](#tzgen-cli-tool) CLI tool
or a [programmatic API](#programmatic-api) to generate the final contract code.
A generated FA2 contract is composed of several orthogonal features. Each
feature defines a set of possible options that can be selected independently. A
combination of selected options for all supported features defines a
specification describing resulting FA2 contract behavior. Available features and
their options are described below.

### Token Kind

This feature defines the kinds of tokens supported by the FA2 contract.
Available options are listed below:

* `USE_NFT_TOKEN` - contract implementation will support multiple non-fungible
  tokens (similar to Ethereum ERC-721).
* `USE_FUNGIBLE_TOKEN` - contract implementation will support a single fungible
  token (similar to Ethereum ERC-20).
* `USE_MULTI_FUNGIBLE_TOKEN` - contract implementation will support multiple
  fungible tokens (similar to Ethereum ERC-1155).

### Minter Functionality

This feature defines optional support for token minting and burning. Multiple
options from the list can be selected at the same time. If none of the options
are selected, the resulting FA2 contract will not provide mint/burn
functionality.

* `CAN_MINT` - contract can mint new tokens.
* `CAN_BURN` - contract can burn tokens.
* `CAN_FREEZE` - contract can be frozen. Once an FA2 contract is frozen, no new
  tokens can be minted or burned. (However, existing tokens still can be
  transferred.) This option can be selected only if either `CAN_MINT` or
  `CAN_BURN` (or both) are selected.

### Contract Admin

A contract can define some privileged entry points that can be accessed by the
current contract admin address. There are several available options defining the
admin feature implementation:

* `USE_NO_ADMIN` - contract does not have an admin. Every entry point can be
  invoked by any address.
* `USE_SIMPLE_ADMIN` - contract has a single admin.
* `USE_PAUSABLE_SIMPLE_ADMIN` - contract has a single admin. The admin can pause
  and unpause the contract. (A paused contract cannot transfer its tokens.)
* `USE_MULTI_ADMIN` - contract can have multiple admins. An admin can pause and
  unpause the contract.

### Minter Admin

This feature defines access to mint and burn functionality defined by the
[minter](#minter-functionality) feature.

* `USE_NULL_MINTER_ADMIN` - contract does not have a minter admin. When neither
  `CAN_MINT` nor `CAN_BURN` feature is selected, anyone can mint or burn tokens.
  This is also the default option if neither mint nor burn feature is selected.
* `USE_ADMIN_AS_MINTER` - contract admin can also mint and burn tokens.
* `USE_MULTI_MINTER_ADMIN` - contract can have multiple minter admins that can
  mint and burn tokens. The minter admin list is separate from the contract
  admin(s).

### Contract Specification Example

```
Token Kind (implementation): USE_NFT_TOKEN,
Minter: [CAN_MINT, CAN_FREEZE],
Admin: USE_PAUSABLE_SIMPLE_ADMIN
Minter Admin: USE_ADMIN_AS_MINTER
```

The resulting FA2 contract will support NFTs, be able to mint new tokens, and
freeze the token collection after minting. The contract will have a simple
(single) admin that can pause and unpause it. Only the admin will be able to
mint tokens and freeze the NFT collection.

## tzGen CLI Tool

`fa2-contracts` package includes `tzGen` CLI tool that generates CameLIGO
contract code and TypeScript interface to initialize contract storage for the
contract origination and to interact with the originated contract.

### Initial Setup

First, you will need to add a development dependency on the
`@oxheadalpha/fa2-contracts` package by running the following command:

```sh
$ yarn add -D @oxheadalpha/fa2-contracts
```

It is also possible to install the package globally.

### Import LIGO Code

Import reusable LIGO modules code into your project directory:

```sh
$ yarn tzgen import-ligo [dir]
```

You may specify a project subdirectory name as the command argument. The default
option is `./ligo`.

Example:

```sh
$ yarn tzgen import-ligo
LIGO sources imported to ~/your_project/ligo
```

### Initialize tzGen Environment

`tzGen` needs to know where your LIGO source code, TypeScript source code, and
compiled Michelson contracts are located. The `init` command creates a `tzGen`
environment configuration file `tzgen.json` and has the following options:

* `--ligo <ligo_dir>` - LIGO source code directory (same as the directory used
  for `import-ligo` command). The default is `./ligo`.
* `--compile-out <out_dir>` - LIGO compilation output directory to put compiled
  Michelson files. The default is `./ligo/out`.
* `--ts <ts_dir>` - TypeScript source directory. Used to put generated
  TypeScript files. The default is `./src`.

Example:

```sh
$ yarn tzgen init --compile-out ./dist
~/your_project/tzgen.json config file created
```

Generated `tzgen.json` file:

```json
{
  "ligoDir": "./ligo",
  "compileOutDir": "./dist",
  "tsSourceDir": "./src"
}
```

### Create FA2 Contract Specification

Before generating a contract code or TypeScript API, you need to create a contract
specification by selecting a combination of features described in the
[modular contracts](#modular-contracts) section. `spec` command accepts a name
of the resulting specification file and the following required options:

* `--kind <kind>` FA2 token kind. Available options are:
  * `NFT` non-fungible tokens
  * `FT` single fungible token
  * `MFT` multi-fungible-tokens
* `-admin <admin>` type of the contract admin. Available options are:
  * `NO_ADMIN` contract does not have an admin.
  * `SIMPLE` contract has a simple admin.
  * `PAUSABLE` contract has a simple admin and can be paused.
  * `MULTI` contract has multiple admins and can be paused.
* `--minter [minter...]` a list of the minting features. Available options are:
  * `MINT` contract can mint tokens.
  * `BURN` contract can burn tokens.
  * `FREEZE` mint/burn operations can be frozen.
* `--minter_admin <minter_admin>` type of the minter admin implementation. Available
  options are:
  * `NO_ADMIN` contract does not have a minter admin role. Everyone can mint/burn
    tokens.
  * `CONTRACT_ADMIN` minter admin is the same as the contract admin.
  * `MULTI` contract can have multiple minter admins.

Example:

```sh
$ yarn tzgen spec my_contract.json --kind NFT --admin PAUSABLE --minter MINT FREEZE --minter_admin CONTRACT_ADMIN
~/my_project/my_contract.json spec file created
```

Generated `my_contract.json` file:

```json
{
  "implementation": "USE_NFT_TOKEN",
  "admin": "USE_PAUSABLE_SIMPLE_ADMIN",
  "minter": [
    "CAN_MINT",
    "CAN_FREEZE"
  ],
  "minterAdmin": "USE_ADMIN_AS_MINTER"
}
```

### Generate LIGO Code

Now you can use a contract specification file to generate a contract code and
compile it. `contract` command takes two arguments: the name of the
specification file and the name of the resulting CameLIGO file. The resulting
file will be created in `src` subdirectory of the LIGO sources location
(`./ligo/src/` in our case).

```sh
$ yarn tzgen contract my_contract.json my_contract.mligo
contract source code file ~/my_project/ligo/src/my_contract.mligo is generated
```

### Generate Michelson Code

The `michelson` command generates Michelson code from the contract CameLIGO
source code (in other words, compiles the contract). The command takes two
required arguments: contract source file name and output file name. It can also
take an option `--main`, specifying the main entry point function. The generated
contract source code will have the main entry point function, named
`asset_main`. The default value for the `--main` option of the `michelson`
command is the same, thus the option can be omitted. The resulting file will be
created in the LIGO output directory from `tzGen` configuration (`./dist` in our
case).

Example:

```sh
$ yarn tzgen michelson my_contract.mligo my_contract.tz
ligo version 0.67.1

compiled contract to ~/my_project/dist/my_contract.tz file
```

### Generate TypeScript Code

The `type-script` command generates a TypeScript interface for the contract from
the specification file. The command takes two arguments: the name of the
specification file and the name of the resulting TypeScript file. The resulting
file will be created in the TypeScript source code location (`./src` in our
case).

Example:

```sh
$ yarn tzgen type-script my_contract.json my_contract.ts
contract interface source code file ~/my_project/src/my_contract.ts is generated
```

The resulting file will contain two functions: `createStorage` to create a
storage object for the contract origination and `createContractInterface` to get
a strongly typed interface to interact with the contract on the block chain. To
use and compile a generated file, your package must include dependencies on
`@taquito/taquito` and `@oxheadalpha/fa2-interfaces` packages.

Below is the generated TypeScript code for our example contract specification:

```ts
import { TezosToolkit } from '@taquito/taquito';
import * as fa2 from '@oxheadalpha/fa2-interfaces';
import { address, tezosApi } from '@oxheadalpha/fa2-interfaces';

export const createStorage = fa2.contractStorage
  .with(fa2.pausableSimpleAdminStorage)
  .with(fa2.nftStorage)
  .with(fa2.mintFreezeStorage)
  .build;

export const createContractInterface = async (
  toolkit: TezosToolkit,
  address: address
) =>
  (await tezosApi(toolkit).at(address))
    .withFa2()
    .withPausableSimpleAdmin()
    .asNft()
    .withMint()
    .withFreeze()
    ;
```

Those functions may be used for the contract origination:

```ts
const storage = createStorage({
    metadata: jsonMetadata,
    owner: ownerAddress
  });
  const code = fs.readFileSync('../dist/my_contract.tz', {
    encoding: 'utf8',
    flag: 'r'
  });
  const originationOp = await tz.contract.originate({ code, storage });
  const contract = await originationOp.contract();
```

and interaction with the originated one:

```ts
const fa2 = await createContractInterface(tz, contractAddress);
await runMethod(fa2.mintFreeze());
```

For more details about how to use and customize contract interface combinators
please refer to
[@oxheadalpha/fa2-interfaces](https://github.com/oxheadalpha/nft-tutorial/tree/master/packages/fa2-interfaces#readme)
package documentation.

## Programmatic API

Besides the `tzGen` CLI tool, it is also possible to provide the contract
specification and generate the LIGO contract code using programmatic API. The
combinator API lets you define the contract specification and then call
`generate()` method to generate the contract code.

### Implementation Combinators

First, you need to choose a token kind by selecting one of three `Implementation` 
combinators:

* `nft()` implement NFT FA2 contract.
* `fungible()` implement a single fungible token FA2 contract.
* `multiFungible()` implement multiple fungible tokens FA2 contract.

### Contract Admin Combinators

* `withNoAdmin()` contract does not have an admin.
* `withSimpleAdmin()` contract has a single admin.
* `withPausableSimpleAdmin()` contract has a single admin that can pause and
  unpause the contract.
* `withMultiAdmin()` contract has multiple admins that can pause and unpause the
  contract.

### Token Minter Combinators

Minter combinators are optional and let you specify whether the FA2 contract will be
able to mint and burn new tokens.

* `withNoMinter()` contract cannot mint or burn tokens.
* `withMint()` contract can mint new tokens.
* `withBurn()` contract can burn tokens.
* `withFreeze()` mint/burn functionality can be frozen.

### Minter Admin Combinator

If a contract has mint/burn functionality, you have to select
[minter admin](#minter-admin) implementation as well.

* `withNoMinterAdmin()` no minter admin. Anyone can mint/burn tokens.
* `withAdminAsMinter()` contract admin is also a minter admin.
* `withMultiMinterAdmin()` contract has multiple minter admins.

### Generate Contract Code

Once you selected a contract specification using the combinator API you can invoke
`generate()` method to generate contract code as in the example below:

```typescript
const contractCode =
  Implement.nft()
    .withPausableSimpleAdmin()
    .withMint()
    .withFreeze()
    .withAdminAsMinter()
    .generate();
```

## CameLigo Modules

* [fa2](./ligo/fa2_lib/fa2) FA2 interface and standard errors definition.
* [fa2/lib](./ligo/fa2_lib/fa2/lib) helpers, various LIGO modules used for the
  FA2 implementation.
  * [fa2/lib/fa2_operator_lib.mligo](./ligo/fa2_lib/fa2/lib/fa2_operator_lib.mligo)
    helper functions and storage to manage and validate FA2 operators.
  * [fa2/lib/fa2_owner_hooks_lib.mligo](./ligo/fa2_lib/fa2/lib/fa2_owner_hooks_lib.mligo)
    helper functions to support sender/receiver hooks.
* [token](./ligofa2_lib/fa2_lib/token) core implementation of the FA2 functionality
  and entry points for various token types.
  * [token/fa2_nft_token.mligo](./ligo/fa2_lib/token/fa2_nft_token.mligo) core FA2
    implementation for NFT tokens (similar to Ethereum ERC-721).
  * [token/fa2_fungible_token.mligo](./ligo/fa2_lib/token/fa2_fungible_token.mligo)
    core FA2 implementation for a single fungible token (similar to Ethereum ERC-20).
  * [token/fa2_multi_fungible_token.mligo](./ligo/fa2_lib/token/fa2_multi_fungible_token.mligo)
    core FA2 implementation for multiple fungible tokens (similar to Ethereum ERC-1155).
* [minter](./ligo/fa2_lib/minter) implementation of mint and burn functionality.
  Each minter module corresponds to one of the `token` core implementation modules.
* [admin](./ligo/fa2_lib/admin) various implementations of the contract admin module.
  The admin may pause/unpause the contract and have access to other privileged
  contract entry points. Each admin implementation has a common LIGO module signature.
  * [admin/no_admin.mligo](./ligo/fa2_lib/admin/no_admin.mligo) implementation of
    the admin module where everyone is admin of the contract.
  * [admin/simple_admin.mligo](./ligo/fa2_lib/admin/simple_admin.mligo)
    implementation of the admin module that has a single admin address; admin
    address can be changed.
  * [admin/pausable_simple_admin.mligo](./ligo/fa2_lib/admin/pausable_simple_admin.mligo)
    same as `simple_admin`, but lets pause/unpause the contract.
  * [admin/multi_admin.mligo](./ligo/fa2_lib/admin/multi_admin.mligo) implementation
    of the admin module that may have multiple admins; lets pause/unpause the
    contract and add/remove the admins.
* [minter_admin](./ligo/fa2_lib/minter_admin) various implementations of the
  contract minter admin (minter is an address that has rights to mint new tokens).
  Each minter admin implementation has a common LIGO module signature.
  * [minter_admin/null_minter_admin.mligo](./ligo/fa2_lib/minter_admin/null_minter_admin.mligo)
    implementation of the minter admin module that allows everyone to mint new
    tokens.
  * [minter_admin/multi_minter_admin.mligo](./ligo/fa2_lib/minter_admin/multi_minter_admin.mligo)
    implementation of the minter admin module that can have multiple addresses
    allowing to mint new tokens and add/remove new minters.

### Common LIGO Admin Module Signature

* `admin_storage` type of the admin storage (used as a part of the whole
  contract storage).
* `admin_entrypoints` type of the admin entry points
* `admin_main` implementation of the admin entry points (used by the contract
  main entry point).
* `is_admin`, `fail_if_not_admin`, `fail_if_not_admin_ext` functions to guard
  privileged operations in the contract implementation.
* `is_paused` function to guard a paused contract.

### Common LIGO Minter Admin Module Signature

* `minter_admin_storage` type of the minter admin storage (used as a part of the
  whole contract storage).
* `minter_admin_entrypoints` type of the minter admin entry points.
* `minter_admin_main` implementation of the minter admin entry points (used by the
  contract main entry point).
* `is_minter` function to guard access to mint tokens operation(s).
