# Content

This document describes how to use the TypeScript/JavaScript FA2 API built on
top of [Taquito](https://tezostaquito.io/). It simplifies operations required to
work with Non-Fungible Tokens (NFT), Fungible Tokens and when TypeScript is
used, provide a type-safe API to contracts.

## Table of Contents

* [Creating a Collection (Originating a Contract)](#creating-a-collection-originating-a-contract)
* [Creating Token Metadata](#creating-token-metadata)
* [Type-Safe Contract Abstraction](#type-safe-contract-abstraction)
* [Minting](#minting)
* [Transferring Token Ownership](#transferring-token-ownership)
* [Update Operators](#update-operators)
* [Beyond NFT Contracts](#beyond-nft-contracts)
* [Custom Contracts](#custom-contracts)
  * [Custom Contract API Example](#custom-contract-api-example)
* [Executing Multiple Operations in One Batch](#executing-multiple-operations-in-one-batch)

### Creating a Collection (Originating a Contract)

Your collection of tokens (non-fungible or fungible) is represented on the Tezos
Blockchain by a smart contract. To create a collection, we need to originate
(create) a contract on the blockchain. Each contract has a code representing its
actions and storage. This package does not help you to create the code for the
contract but it can simplify storage initialization. To create the contract code
you can use the
[@oxheadalpha/fa2-contract](https://github.com/oxheadalpha/nft-tutorial/tree/master/packages/fa2-contracts#readme)
package. Here we will show how to initialize a storage using storage combinators
and originate a contract using
[Taquito](https://tezostaquito.io/docs/originate).

The storage initialization combinators can be thought of as a `(params: I) => S`
function, which takes an object representing input parameters `I` and returns an
object representing an initial storage `S`. Storage S is a plain old JavaScript
objects that can be used by the
[Taquito](https://tezostaquito.io/docs/originate) `originate` method. Functions
are wrapped into the `StorageBuilder` type that allows functions to be composed
together and receive new, more complicated functions. Here is an example of a
very simple builder:

```typescript
const simpleAdmin = storageBuilder(({ ownerAddress }: { owner: address }) => ({
  admin: ownerAddress,
  pending_admin: undefined
}));
```

The above creates a storage builder that requires one parameter, `ownerAddress`,
and returns an initial storage with two fields: `admin` and `pending_admin`. To
create a storage using this builder, you can invoke the `build` method:

```typescript
  const storage = simpleAdmin.build({ownerAddress: 'tzAddress'})
```

TypeScript will infer the type correctly and will not allow to invoke the
`build` with inappropriate parameters. After invoking the `build` method,
TypeScript will also correctly infer the type of `storage`.

The storage builder has the `.with` method that allows two builders to be combined:

```typescript
const newBuilder = storageA.with(storageB)
```

The above code will create a builder that requires both input parameters for
`storageA` and `storageB` and will return an initial storage that will have
fields of `storageA` and `storageB`.

In practice, you will only need to write builders if you use your own custom
contracts that require a custom initial storage. For the predefined contracts,
located in [fa2-contracts](https://github.com/oxheadalpha/nft-tutorial/tree/master/packages/fa2-contracts#readme),
you can create an initial storage just by composing existing storage builders
together. We usually start by using the `contractStorage` predefined builder,
which requires just one parameter `metadata` and uses the `.with` method multiple
times.

Here is an example:

```typescript
const storageBuilder = contractStorage
  .with(pausableSimpleAdminStorage)
  .with(nftStorage) 
  .with(mintFreezeStorage) 
```

In the above example we create a contract initial storage by composing 3
builders. This is for a contract that can pause, store NFT tokens, and freeze
the storage.

You can find out what kind of contract APIs you can create and how to initialize
a storage for them [here](#beyond-nft-contracts).

Now we can build the storage:

```typescript
const storage = storageBuilder.build({
  owner: 'tzAddress',
  metadata: 'meta...'
});
```

We can also use
[tzGen](https://github.com/oxheadalpha/nft-tutorial/tree/master/packages/fa2-contracts#tzgen-cli-tool),
a tool from
[@oxheadalpha/fa2-contracts](https://github.com/oxheadalpha/nft-tutorial/tree/master/packages/fa2-contracts#readme),
to automatically generate storage builders composition from the contract
specification.

To originate the contract with this initial storage you can use Taquito like this:

```typescript
import { TezosToolkit } from '@taquito/taquito';
const tz = new TezosToolkit('https://...');

const op = await tz.contract.originate({ code: 'code...', storage })
```

### Creating Token Metadata

In order to create a token, we first need to create token metadata. Token
metadata has to conform to
[TZIP-21](https://gitlab.com/tezos/tzip/-/tree/master/proposals/tzip-21).

There are two ways to create metadata for a token: **on-chain** and
**off-chain**. The artifact itself is always kept off-chain, usually in
[IPFS](https://docs.ipfs.io/concepts/what-is-ipfs/). However, the token
attributes can be kept either **on-chain** or **off-chian**.

The simplest way to create **on-chain** metadata is by using the
`createSimpleNftMetadata` function:

```typescript
createSimpleNftMetadata(
  1, // Token ID
  'My Picture', // Token Name
  'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' // IPFS URI
);
```

The metadata can have more attributes and can look like this:

```json
{
  "decimals": 0,
  "isBooleanAmount": true,
  "name": "My Picture",
  "description": "",
  "tags": [
    "awesome",
    "nft"
  ],
  "minter": "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
  "artifactUri": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "displayUri": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "thumbnailUri": "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "creators": [],
  "rights": "",
  "attributes": [
    {
      "name": "location",
      "value": "New York"
    }
  ]
}
```

There can be separate URIs for display and thumbnail images. To make sure that
the format of metadata confirms to
[TZIP-21](https://gitlab.com/tezos/tzip/-/tree/master/proposals/tzip-21)
standard, it is a good idea to validate it before creation. This can be done
with the `validateTzip21` function as shown below:

```typescript
import { validateTzip16 } from '@oxheadalpha/fa2-interfaces';

const meta = JSON.parse(metaJson);
const validationResults = validateTzip21(meta);
const errorsOnly = validationResults.filter(r => r.startsWith('Error:'));
```

Before creating **off-chain** metadata, we should first create it in the
JSON format and upload to IPFS. Then, **off-chain** metadata can be created
using a helper function:

```typescript
const tokenMetadata = createOffChainTokenMetadata(
  1, // Token ID
  'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' // IPFS URI
)
```

We are now ready to interact with our contract.

### Type-Safe Contract Abstraction

To interact with a contract on the blockchain we need to create an API object
that represents your contract (collection). As it is a wrapper around
[Taquito](https://tezostaquito.io/), first we will need to create Taquito
`TezosToolkit`.

```typescript
const tzt = new TezosToolkit(...);
const myContract = await tezosApi(tz).at(contractAddress)
```

At this point we can specify what kind of tokens and what methods we
have in our contract. It is done like this:

```typescript
const nftContract = myContract.asNft().withMint()
```

Depending on the type of token, contract methods can have different
implementations and require different parameters. You have to specify the type
of token by using `asNft()` (as we are going to mint NFTs), and then the
required methods by using `withMint()`, `withBurn()`, `withFreeze()`, or a
combination of methods. TypeScript will infer the right type of `nftContract`
and validate the method with their parameters at compile time. Now we are ready
to interact with our contract.

### Minting

Minting (creating new tokens) can be done by calling the `mint` method:

```typescript
const op: TransactionOperation = await fa2.runMethod(
  nftContract.mint([
    { 
      owner: 'tz1PSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', 
      tokens: [tokenMetadata1, tokenMetadata2] }
  ])
);
```

In order to save gas, `mint` accepts a batch of mint requests in order to be
able to bundle multiple tokens creation into one request. Methods that
call/invoke contract entry points return the `Taquito` type
`<ContractMethod<ContractProvider>>`.These methods can be sent and confirmed
individually, or in a batch, directly using the Taquito API. However, as they
are frequently used operations, we have two helpers: `runMethod` & `runBatch`

At this point it would be nice to inspect the created tokens. According to
[TZIP-12](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md),
standard contracts that handle tokens, weather they be non-fungible or fungible
tokens have these methods: `balance_of`, `transfer`, `update_operator`. For NFTs
we have the `hasNftTokens` wrapper that returns boolean values. However, to use
it we have to extend our contract abstraction with the `.withFa2` method:

```typescript
const fa2Contract = nftContract.withFa2()
```

Now, we can use the `hasNftTopkens` method to inspect the created tokens:

```typescript
const results = fa2Contract.hasNftTokens([
  { owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', token_id: 1 },
  { owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', token_id: 2 }
]);

const allGood = results.every(r => r === true)
```

For fungible tokens you would use the method, `queryBalances`, instead of
`hasNftTokens` that will return a list of balances. For more information look
[here](src/interfaces/fa2.ts#L140)

### Transferring Token Ownership

Token ownership can be transferred using the method, `transferTokens`. This
method takes a list of transfers and executes them. Transfers can be constructed
manually but it is easier to use "Transfers Batch API" to do that. It will
automatically merge subsequent transactions from the same source in order to
optimise gas usage. Here is how it can be done:

```typescript
const transfers = transferBatch()
  .withTransfer('tzFromAccount1', 'tzToAccount1', 1 /* tokenId */, 1 /* amount */)
  .withTransfer('tzFromAccount1', 'tzToAccount2', 2 /* tokenId */, 1 /* amount */)
  .transfers;

const op = await fa2.runMethod(fa2Contract.transferTokens(transfers));
```

For NFT tokens the amount should always be 1.

### Update Operators

Multiple operators can transfer tokens on behalf of the owner. The token owner
can use the `updateOperators` method to add or remove other addresses that can
transfer the owner's tokens. Updates can be built manually or, like transfers,
can be built using the batch API:

```typescript
const batch = operatorUpdateBatch().
   .addOperator('tzOwner1', 'tzOperator1', 1)
   .removeOperator('tzOwner2, 'tzOperator2', 2)
   .addOperators([
     { owner: 'tzOwner3', operator: 'tzOperator3', token_id: 3 },
     { owner: 'tzOwner4', operator: 'tzOperator4', token_id: 4 }
   ])
   .updates;
 
 await runMethod(contract.updateOperators(batch));
 ```

### Beyond NFT Contracts

Besides interacting with contracts representing **NFTs**, it is possible to
interact with any FA2 contract representing **fungible tokens** or
**multi-fungible tokens**. It is also possible for a contract to have the
ability to freeze created tokens, give rights to other addresses to administer
contracts, etc. Many combinations of those contract traits can be expressed by
using composable combinators on
[the contract abstraction](#type-safe-contract-abstraction).

**Contract Abstraction Combinators** and **Storage Combinators** are different
and can be used independently. **Contract Abstraction Combinators** are used to
describe the API to the contract, while **Storage Combinators** are used to
describe the shape of the storage and its initial values. A storage is mostly
used for contract origination and is rarely required for the interaction with
the contract as **Lambda Views** are used to "read" the state of the contract.
However, storage and contract actions (API methods) are related - certain
actions require a contract to have certain data. For example, the `freeze`
method requires a contract to have a flag in the storage that is described by
`.with(mintFreezeStorage)`. We give the description of those combinators
together.

The combinators can be divided into groups. Only one combinator from each group
can be used at a time on one contract.

Below is the list of contract administration methods:

* `.withSimpleAdmin` - adds the ability to set just one address to be the
  administrator of a contract. It allows you to call just 2 additional methods,
  `setAdmin` and `confirmAdmin`. For more information look
  [here](src/interfaces/admin.ts#l10).
  To initialize the storage, use
  `.with(simpleAdminStorage)`

* `.withPausableSimpleAdmin` - adds the ability to pause and unpause the
  contract. For more information look [here](src/interfaces/admin.ts#l35) To
  initialize the storage use `.with(pausableSimpleAdminStorage)`

* `.withMultiAdmin` - adds the ability to have multiple admins for the same
  contract, as well as to add and remove admin. For more information look
  [here](src/interfaces/admin.ts#l42). To initialize the storage use
  `.with(multiAdminStorage)`

Below is the list of combinators that specify what kind of tokens the contract
holds. They do not add methods that can be used by a client, but they influence
how subsequent methods like `withMint` or `withBurn` will work and what
parameters they can take.

* `.asNft` - specifies that the contract represents **NFTs**. To initialize the
  storage use `with(nftStorage)`

* `.asFungible` - specify that the contract represents a single type of
  **fungible token**. To initialize the storage use `with(fungibleTokenStorage)`

* `asMultiFungible` - specifies that the contract represents multiple **fungible
  tokens** and it can have more that one type of token, which is specified by
  the token ID. To initialize the storage use `with(multiFungibleTokenStorage)`

Below is the group of combinators that should be used on top of any one of the
combinators from the previous group. You can find more details about each method
that the combinators can add [here](src/interfaces/minter-combinators.ts#L17)

* `withMint` - specifies that the contract can mint new tokens.

* `withBurn` - specifies that the contract can burn (remove) previously
created tokens.

* `withFreeze` - specifies that the contract can freeze the collection, after a
  certain number of tokens are created. To initialize the storage use
  `with(mintFreezeStorage)`.

There is also `withMultiMinterAdmin`, which allows us to add and remove
addresses that can mint and burn token. [Here](src/interfaces/minter-admin.ts)
are the details. To initialize the storage for this type of contract use
`with(multiMinterAdminStorage)`.

`withFa2` adds the methods specified by
[TZIP-12 standard](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md)
that every FA2 contract is required to have. You can find the details
[here](src/interfaces/fa2.ts#L135)

Here is a complete example:

```typescript
const tzt = new TezosToolkit(...);
const myContract = await tezosApi(tz).at(contractAddress)

const nftContract = myContract
    .withPausableSimpleAdmin()
    .withFa2()
    .asNft()
    .withMint()
    .withBurn()
    .withFreeze()
```

In the above example we create an NFT contract that can mint, burn, and freeze.
It is pausable, and can use methods specified by FA2. If you need to initialize
the storage for it you can do this:

```typescript
  const storage = contractStorage
    .with(pausableSimpleAdminStorage)
    .with(nftStorage)
    .with(mintFreezeStorage)
    .build({
      owner: 'tzAddress',
      metadata: 'meta...'
    })
```

### Custom Contracts

Interaction with a custom contract in a type-safe way can be achieved
with very little boilerplate code. A new API can be
implemented by providing just one constructor function with the following
signature:

```typescript
<T>(contract: Tzip12Contract, lambdaView?: address) => T
```

The `T` type here is just an object(a record of functions) and can be
implemented anyway possible, including using a TypeScript class. If it is a
TypeScript class, it has to be wrapped in a function like this:

```typescript
export const MyContractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): T => new MyClass(contract, lambdaView)
```

Now, we can extend our contract abstraction with the generic `.with` combinator:

```typescript
const contract = await tezosApi(toolkit).at(contractAddress);
const myContractApi = contract.with(MyContractApi);
```

The `myContractApi` object will have all the API methods defined by MyClass.

#### Custom Contract API Example

Let's assume that the contract has two custom entry points: `set_counter` that
accepts a `nat` parameter and [CPS-style view](https://tezostaquito.io/docs/lambda_view/)
`get_counter`.

First we define a TypeScript interface for those contract entry points:

```typescript
export interface MyContract {
  setCounter(counter: nat): ContractMethod<ContractProvider>;
  getCounter(): Promise<nat>;
}
```

Second we define a constructor function with the contract calls implementation:

```typescript
export const MyContractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): T => ({
  setCounter: (counter: nat) => contract.methods.set_counter(counter),
  getCounter: async () => contract.views.get_counter().read(lambdaView)
});
```

### Executing Multiple Operations in One Batch

As described above, you can bundle multiple tokens in one `mint` request or
batch requests to `transferTokens` & `updateOperators`. Sometimes, however, it
is still not enough. You might want to send multiple requests that deal with
different contracts or use unrelated methods in one batch. This can be done
using the [Taquito](https://tezostaquito.io/) batch. We have a helper method,
`runBatch`, that simplifies sending batches and waiting for their confirmations.

Here is an example:

```typescript
const batch = toolkit.contract.batch();

batch.withContractCall(fa2Contract1.transferTokens(txs1));
batch.withContractCall(fa2Contract1.transferTokens(txs2));
const op: BatchOperation = await fa2.runBatch(batch);
```

For more information, please look [here](src/taquito-run.ts#27)
