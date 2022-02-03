# Content

TypeScript interfaces to generic and NFT FA2 contracts.

## Table of Contents

* [Metadata Validation](#metadata-validation)
* [Taquito and Michelson Type Aliases](#taquito-and-michelson-type-aliases)
* [Taquito Wrappers Providing Type-Safe Contract API](#taquito-wrappers-providing-type-safe-contract-api)
* [Helpers to Run Taquito `ContractMethod`](#helpers-to-run-taquito-contractmethod)
* [FA2 Contract API Methods](#fa2-contract-api-methods)

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
a [Lambda View](https://tezostaquito.io/docs/lambda_view) to be used in FA2 API.
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
types of the methods in the specified APIs. Now the calls to methods in
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

The `T` type here is just an object(a record of functions) and can be
implemented anyway possible, including using TypeScript class. In this case it
has to be wrapped in a function like this:

```typescript
export const MyContractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): Fa2Contract => new MyClass(contract, lambdaView)
```

### Helpers to Run Taquito `ContractMethod`

In FA2 API methods that call/invoke contract entry points return `Taquito` type
`<ContractMethod<ContractProvider>>`. These methods can be sent and confirmed
individually, or in a batch, directly using Taquito API. However, as it is
a frequently used operations we have two helpers: `runMethod` & `runBatch`.

```typescript
/**
 * Run and confirms a Taquito ContractMethod
 * @param cm - a Taquito ContractMethod
 * @returns  Taquito TransactionOperation
 */
export const runMethod = async (
  cm: ContractMethod<ContractProvider>
): Promise<TransactionOperation>
```

Usage example:

```typescript
const op: TransactionOperation = await fa2.runMethod(fa2Contract.transferTokens(txs));
```

Alternatively, contract methods can be added into a batch and then send &
confirmed using helper `runBatch`.

```typescript
/**
 * Run and confirms a Taquito batch
 * @param batch - a Taquito OperationBatch
 * @returns  Taquito BatchOperation
 */
export const runBatch = async (
  batch: OperationBatch
): Promise<BatchOperation>
```

Usage example:

 ```typescript
const batch = toolkit.contract.batch();

batch.withContractCall(fa2Contract.transferTokens(txs1));
batch.withContractCall(fa2Contract.transferTokens(txs2));
const op: BatchOperation = await fa2.runBatch(batch);
```

### FA2 Contract API Methods

Most of the FA2 Contract API methods are well-described in the source code
comments for the
[Fa2Contract](https://github.com/oxheadalpha/nft-tutorial/blob/master/packages/fa2-interfaces/src/fa2-interface.ts)
type.

```typescript
/**
 * Query balances for multiple tokens and token owners.
 * Invokes FA2 contract `balance_of` entry point
 */
queryBalances: (requests: BalanceRequest[]) => Promise<BalanceResponse[]>;
```

```typescript
/**
 * Query balances for multiple tokens and token owners and represents
 * results as NFT ownership status.
 * Invokes FA2 contract `balance_of` entry point
 */
hasNftTokens: (requests: BalanceRequest[]) => Promise<boolean[]>;
```

```typescript
/**
 * Extract tokens metadata
 */
tokensMetadata: (tokenIds: number[]) => Promise<TokenMetadata[]>;
```

```typescript
/**
 * Transfer tokens. In default implementation, only token owner or its operator
 * can transfer tokens from the owner address. * 
 */
transferTokens: (transfers: Transfer[]) => ContractMethod<ContractProvider>;
```

This methods takes a list of transfers and executes them. Transfers can be
constructed manually but it is easier to use "Transfers Batch API" to do that.
It will merge automatically subsequent transaction from the same source in order
to optimise gas.

Here is an example of using the batch API:

```typescript
const transfers = transferBatch()
  .withTransfer('tzFromAccount1', 'tzToAccount1', 1, 1)
  .withTransfer('tzFromAccount1', 'tzToAccount2', 2, 1)
  .transfers;

const op = await fa2.runMethod(fa2Contract.transferTokens(transfers));
```

```typescript
/**
* Update list of operators who can transfer tokens on behalf of the token
* owner. In default implementation, only the owner can update its own operators.
*
* @param updates a list of either add or remove operator commands
*/
updateOperators: (
  updates: OperatorUpdate[]
)
```

Updates here can be built manually or using batch API like this:

```typescript
const batch = operatorUpdateBatch().
  .addOperator('tzOwner1', 'tzOperator1', 1)
  .removeOperator('tzOwner2, 'tzOperator2', 2)
  .addOperators([
    { owner: 'tzOwner3', operator: 'tzOperator3', token_id: 3 },
    { owner: 'tzOwner4', operator: 'tzOperator4', token_id: 4 }
  ])
  .updates;

const op = await fa2.runMethod(fa2Contract.updateOperators(batch));
```
