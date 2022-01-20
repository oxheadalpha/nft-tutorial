# Content

* [LIGO](https://ligolang.org/) library of reusable modules to implement FA2
  contracts.
* TypeScript interfaces to generic and NFT FA2 contracts.

## Table of Contents

* [LIGO](#ligo)
  * [Scripts](#scripts)
  * [Cameligo Modules](#cameligo-modules)
    * [Common LIGO Admin Module Signature](#common-ligo-admin-module-signature)
    * [Common LIGO Minter Admin Module Signature](#common-ligo-minter-admin-module-signature)
* [TypeScript API](#typescript-api)
  * [Metadata Validation](#metadata-validation)
  * [Taquito and Michelson Type Aliases](#taquito-and-michelson-type-aliases)

## LIGO

### Script

`export-ligo <my_ligo_sources_dir>` script exports common LIGO source code used
to create FA2 contracts.

Usage example:

```sh
$yarn export-ligo ./ligo
```

### Cameligo Modules

* [fa2](./ligo/fa2) FA2 interface and standard errors definition
* [fa2/lib](./ligo/fa2/lib) helpers, various LIGO modules used for the FA2 implementation
  * [fa2/lib/fa2_operator_lib.mligo](./ligo/fa2/lib/fa2_operator_lib.mligo)
    helper functions and storage to manage and validate FA2 operators
  * [fa2/lib/fa2_owner_hooks_lib.mligo](./ligo/fa2/lib/fa2_owner_hooks_lib.mligo)
    helper functions to support sender/receiver hooks
* [admin](./ligo/admin) various implementations of the contract admin module.
  The admin may pause/unpause the contract and have access to other privileged
  contract entry points. Each admin implementation has a common LIGO module signature.
  * [admin/no_admin.mligo](./ligo/admin/no_admin.mligo) implementation of the admin
    module where everyone is admin of the contract
  * [admin/simple_admin.mligo](./ligo/admin/simple_admin.mligo) implementation of
    the admin module that has a single admin address; lets pause/unpause the contract
    and change the admin
  * [admin/non_pausable_simple_admin.mligo](./ligo/admin/non_pausable_simple_admin.mligo)
    same as `simple_admin`, but without ability to pause/unpause the contract.
  * [admin/multi_admin.mligo](./ligo/admin/multi_admin.mligo) implementation of
    the admin module that may have multiple admins; lets pause/unpause the contract
    and add/remove the admins
* [minter_admin](./ligo/minter_admin) various implementations of the contract
  minter admin (minter is an address that has rights to mint new tokens). Each
  minter admin implementation has a common LIGO module signature.
  * [minter_admin/no_minter_admin.mligo](./ligo/minter_admin/no_minter_admin.mligo)
    implementation of the minter admin module that prevent everyone from minting
    new tokens
  * [minter_admin/null_minter_admin.mligo](./ligo/minter_admin/null_minter_admin.mligo)
    implementation of the minter admin module that allows everyone to mint
    new tokens
  * [minter_admin/multi_minter_admin.mligo](./ligo/minter_admin/multi_minter_admin.mligo)
    implementation of the minter admin module that can have multiple addresses
    allowing to mint new tokens and add/remove new minters.

#### Common LIGO Admin Module Signature

* `admin_storage` type of the admin storage (used as a part of the whole
  contract storage)
* `admin_entrypoints` type of the admin entry points
* `admin_main` implementation of the admin entry points (used by the contract
  main entry point)
* `is_admin`, `fail_if_not_admin`, `fail_if_not_admin_ext` functions to guard
  privileged operations in the contract implementation
* `is_paused` function to guard a paused contract

#### Common LIGO Minter Admin Module Signature

* `minter_admin_storage` type of the minter admin storage (used as a part of the
  whole contract storage)
* `minter_admin_entrypoints` type of the minter admin entry points
* `minter_admin_main` implementation of the minter admin entry points (used by the
  contract main entry point)
* `is_minter` function to guard access to mint tokens operation(s)

## TypeScript API

### Metadata Validation

```typescript
/**
 * Validate contract metadata format in accordance with TZIP-16 standard
 * @param meta object representing contract metadata.
 * @returns list of validation errors and/or warnings. Each error string starts
 * with `Error:` prefix and each warning string starts with `Warning:` prefix.
 */
function validateTzip16(meta: object): string[]
```

```typescript
/**
 * Validate token metadata format in accordance with TZIP-21 standard
 * @param meta object representing token metadata.
 * @returns list of validation errors and/or warnings. Each error string starts
 * with `Error:` prefix and each warning string starts with `Warning:` prefix.
 */
function validateTzip21(meta: object): string[]
```

Usage example:

```typescript
import { validateTzip16 } from '@oxheadalpha/fa2-interfaces';

const meta = JSON.parse(metaJson);
const validationResults = validateTzip16(meta);
const errorsOnly = validationResults.filter(r => r.startsWith('Error:'));
```

### Taquito and Michelson Type Aliases

```typescript
/**
 * Taquito contract proxy
 */
type Contract

/**
 * Taquito contract proxy with TZIP-12 and TZIP extension
 */
type ContractExt

/**
 * Taquito contract proxy with TZIP-12 extension
 */
type Tzip12Contract

type address
type nat
type bytes
```

### Taquito Wrappers Providing Type-Safe Contract API

`fa2-interface` package provides Taquito wrappers that allow to use type-safe API
to FA2 contracts. To use the wrappers first an instance of Taquito toolkit
has to be created. It can be done like this:

```typescript
import { TezosToolkit } from '@taquito/taquito';

const tezos = new TezosToolkit('https://YOUR_PREFERRED_RPC_URL');
```

Then the wrapper can be created:

```typescript
import * as fa2 from '@oxheadalpha/fa2-interfaces';

const tezosApi = fa2.tezosApi(tezos).useLambdaView(lambdaView);
```

, where `lambdaView` is an optional parameter that can specify an address of
a "lambda view" to be used in FA2 API.
Then to get an API to a specific contract, method `at` can be used:

```typescript
const contract = await tezosApi.at(address)
```

A contract can support multiple interfaces that can be "mixed" in
by using `with` combinator. Usage example:

```typescript
const fa2Contract = contract.with(Fa2).with(Nft)
```

It works as a type-safe "mixin" and `fa2Contract` will infer all the right
types of the methods in specified APIs. Now the calls to methods in
`fa2Contract` will be checked at compile time:

```typescript
const balances = await fa2Contract.queryBalances(requests);
```

It is not required but if desired the inferred type can be named:

```typescript
type MyContract = typeof faContract
```

If a custom contract and API to it is necessary, it can be implemented just
by providing one constructor function with the following signature:

```typescript
<T>(contract: Tzip12Contract, lambdaView?: address) => T
```

The `T` type is just an object(a record of functions) and can be implemented 
anyway possible, including using `TypeScript` `class`. In this case it has
to be wrapped in a function like this:

```typescript
export const MyContractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): Fa2Contract => new MyClass(contract, lambdaView)
```

### Helpers to Run Taquito `ContractMethod`

In FA2 API methods that update contract storage return `Taquito` type 
`<ContractMethod<ContractProvider>>`. These methods can be sent and confirmed
individually or in a batch directly using the Taquito API. However, as it is
a frequently used operations we have two helpers: `runMethod` & `runBatch`.
`runMethod` can be used like this:

```typescript
const op: TransactionOperation = await fa2.runMethod(fa2Contract.transferTokens(txs));
```

Alternatively, contract methods can be added into a batch and then send &
confirmed using helper `runBatch` like this:

```typescript
const batch = toolkit.contract.batch();

batch.withContractCall(fa2Contract.transferTokens(txs1));
batch.withContractCall(fa2Contract.transferTokens(txs2));

const op: BatchOperation = await fa2.runBatch(batch);
```
