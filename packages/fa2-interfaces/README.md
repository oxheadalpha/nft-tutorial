# Content

This document describes how to use TypeScript/JavaScript FA2 API build on top of
[Taquito](https://tezostaquito.io/). It simplifies operations required to work
with NFT (Non-Fungible Token), Fungible Tokens and, when TypeScript is used,
provide a type-safe API to the contracts.

## Table of Contents

* [Creating a Collection (Originating a Contract)](#creating-a-collection-originating-a-contract)
* [Creating Token Metadata](#creating-token-metadata)
* [Type-Safe Contract Abstraction](#type-safe-contract-abstraction)
* [Minting](#minting)
* [Transferring Token Ownership](#transferring-token-ownership)
* [Update Operators](#update-operators)
* [Beyond NFT Contracts](#beyond-nft-contracts)
* [Custom Contracts](#custom-contracts)
* [Executing Multiple Operations in One Batch](#executing-multiple-operations-in-one-batch)

### Creating a Collection (Originating a Contract)

Your collection of tokens (non-fungible or fungible) is represented on the Tezos
Blockchain by a smart contract. To create a collection, we need to create
(originate) a contract on the blockchain. Each contract has a code, representing
its actions, and a storage, representing its data. This package does not help
you to create the code of the contract but it can simplify storage
initialization. To create the contract code you can use
[fa2-contract](../fa2-contracts/) package. We will show here how to initialize
the storage using storage combinators and originate the contract using
[Taquito](https://tezostaquito.io/docs/originate).

The storage initialization combinators can be though of as a function
`(params: I) => S`, that takes an object representing the input parameters `I`
and returns an object representing initial storage `S`. Storage S is a plain old
JavaScript objects that can be used by
[Taquito](https://tezostaquito.io/docs/originate) `originate` method. Functions
are wrapped into `StorageBuilder` type that allow to compose them together
and receive more new functions. Here is an example of a very simple
builder:

```typescript
const simpleAdmin = storageBuilder(({ ownerAddress }: { owner: address }) => ({
  admin: ownerAddress,
  pending_admin: undefined
}));
```

The above creates a storage builder that requires one parameter `ownerAddress` and
returns an initial storage with two fields: `admin` and `pending_admin`.
To create storage using this builder, you can call `build` method:

```typescript
  const storage = simpleAdmin.build({ownerAddress: 'tzAddress'})
```

TypeScript will infer the type correctly and will not allow to call `build` with
an inappropriate parameters. After calling `build` method TypeScript will
also correctly infer the type of the `storage`.

Storage builder has `.with` method that allows to combine two builders:

```typescript
const newBuilder = storageA.with(storageB)
```

That above will create a builder that requires both input parameters for the
`storageA` and `storageB` and will return an initial storage that will have
fields of `storageA` and `storageB`.

In practice, you will only need to write builders if you use your own custom
contracts that require a custom initial storage. For the predefined contracts
you can create an initial storage just by composing existing storage builders
together. You usually start by using `contractStorage` predefined builder that
requires just one parameter `metadata` and use `.with` method multiple times.

Here is an example:

```typescript
const storageBuilder = contractStorage
  .with(pausableSimpleAdminStorage)
  .with(nftStorage) 
  .with(mintFreezeStorage) 
```

In the above example we create a contract initial storage by composing 3
builders. This is for a contract that can pause, store NFT tokens and allow to
freeze the storage.

You can find out what kind of contract APIs you can create and how to initialize
a storage for them [here](#beyond-nft-contracts).

Now you can build the storage:

```typescript
const storage = storageBuilder.build({
  owner: 'tzAddress',
  metadata: 'meta...'
});
```

To originate the contract with this initial storage you can use Taquito like this:

```typescript
import { TezosToolkit } from '@taquito/taquito';
const tz = new TezosToolkit('https://...');

const op = await tz.contract.originate({ code: 'code...', storage })
```

### Creating Token Metadata

In order to create a token, we first need to create a token metadata.
Token metadata has to confirm to
[TZIP-21](https://gitlab.com/tezos/tzip/-/tree/master/proposals/tzip-21).

There are two ways to create a metadata for your token: **on-chain** and
**off-chain**. Artifact itself is always kept off-chain, usually in
[IPFS](https://docs.ipfs.io/concepts/what-is-ipfs/). However, the attributes
off the token can be kept either **on-chain** or **off-chian**.

The simplest way to create **on-chain** metadata is using
`createSimpleNftMetadata` function:

```typescript
createSimpleNftMetadata(
  1, // Token ID
  'My Picture', // Token Name
  '/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' // IPFS URI
);
```

The metadata can have more attributes and look like this:

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

There can be separate URIs for display and thumbnail if it is an
image. To make sure that the format of metadata confirms to
[TZIP-21](https://gitlab.com/tezos/tzip/-/tree/master/proposals/tzip-21)
standard, it is a good idea to validate it before creation. It can be
done like this:

```typescript
import { validateTzip16 } from '@oxheadalpha/fa2-interfaces';

const meta = JSON.parse(metaJson);
const validationResults = validateTzip21(meta);
const errorsOnly = validationResults.filter(r => r.startsWith('Error:'));
```

Before creating **off-chain** metadata first we should create it in JSON format
and upload to IPFS. Then, **off-chain** metadata can be created using a
helper function:

```typescript
const tokenMetadata = createOffChainTokenMetadata(
  1, // Token ID
  '/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' // IPFS URI
)
```

Now we are ready to interact with our contract.

### Type-Safe Contract Abstraction

To interact with a contract on blockchain we need to create an API object
that represents your contract (collection). As it is a wrapper around
[Taquito](https://tezostaquito.io/), first we will need to create Taquito
`TezosToolkit`.

```typescript
const tzt = new TezosToolkit(...);
const myContract = await tezosApi(tz).at(contractAddress)
```

At this point we can specify what kind of token and what methods we
have in our contract. It is done like this:

```typescript
const nftContract = myContract.asNft().withMint()
```

As depending on the type of a token, contract methods can have different
implementations and require different parameters,
you have to specify type of the token by using `asNft()` (as we are going
to mint NFTs) and then the required methods, by using `withMint()`.
TypeScript will infer the right type of `nftContract` and validated method
and parameters at compile time. Now you are ready to interact with your
contract.

### Minting

Minting (creating new tokens) can be done by calling method `mint`:

```typescript
const op: TransactionOperation = await fa2.runMethod(
  nftContract.mint([
    { 
      owner: 'tz1PSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', 
      tokens: [tokenMetadata1, tokenMetadata2] }
  ])
);
```

In order to save gas `mint` accepts a batch to be able to bundle multiple
tokens creation into one request. Methods that call/invoke contract entry
points return `Taquito` type `<ContractMethod<ContractProvider>>`.These methods
can be sent and confirmed individually, or in a batch, directly using Taquito
API. However, as it is a frequently used operations we have two helpers:
`runMethod` & `runBatch`

At this point it would be nice to inspect created tokens. According to
[TZIP12](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md)
standard contract that handle tokens, weather it be non-fungible or fungible
tokens has methods: `balance_of`, `transfer`, `update_operator`. For NFT we
have `hasNftTokens` wrapper that returns boolean values. However, to use it we
have to extends our contract abstraction with `.withFa2` methods:

```typescript
const fa2Contract = nftContract.withFa2()
```

Now, we can use `hasNftTopkens` methods to inspect created tokens:

```typescript
const results = fa2Contract.hasNftTokens([
  { owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', token_id: 1 },
  { owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', token_id: 2 }
]);

const allGood = results.every(r => r === true)
```

For fungible token you would use method `queryBalances` instead of
`hasNftTokens` that will return the list of balances. For more information look
[here](src/interfaces/fa2.ts#L140)

### Transferring Token Ownership

Token ownership can be transferred using method `transferTokens`. This methods
takes a list of transfers and executes them. Transfers can be constructed
manually but it is easier to use "Transfers Batch API" to do that. It will
merge automatically subsequent transaction from the same source in order
to optimise gas usage. Here is how it can be done:

```typescript
const transfers = transferBatch()
  .withTransfer('tzFromAccount1', 'tzToAccount1', 1 /* tokenId */, 1 /* amount */)
  .withTransfer('tzFromAccount1', 'tzToAccount2', 2 /* tokenId */, 1 /* amount */)
  .transfers;

const op = await fa2.runMethod(fa2Contract.transferTokens(transfers));
```

For NFT tokens the amount should always be 1.

### Update Operators

Multiple operators can transfer tokens on behalf of the owner. Token owner can
use `updateOperators` method to add or remove other addresses that can transfer
owner's tokens. Updates can be built manually or, like transfers, can be built
using batch API like this:

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

Besides interacting with the contracts representing **NFT**, it is possible to
interact with any FA2 contract representing **fungible tokens**,
**multi-fungible tokens**, have the ability to freeze created tokens, give
rights to other addresses to administer contracts etc. Many combinations of
those traits of the contract can be expressed by using composable methods
(combinators) on [contract abstraction](#type-safe-contract-abstraction).

The combinators can be divided into groups, only one combinator from each of the
groups can be used at a time on one contract. For some combinators , to work
correctly, the storage has to be properly initialized during the origination of
the contract. In those cases we give the corresponding storage initializers too.

Below is the list of contract administration methods:

* `.withSimpleAdmin` - adds the ability to set just one address to be an admin
  of a contract. It allows you to call just 2 additional methods `setAdmin` and
  `confirmAdmin`. For more information look
  [here](src/interfaces/admin.ts#l10). To initialize the storage use
  `.with(simpleAdminStorage)`

* `.withPausableSimpleAdmin` - adds the ability to pause/unpause
the  contract. For more information look [here](src/interfaces/admin.ts#l35)
To initialize the storage use `.with(pausableSimpleAdminStorage)`

* `.withMultiAdmin` - adds the ability to have multiple administrators for the
  same contract, add and remove them. For more information look
  [here](src/interfaces/admin.ts#l42). To initialize the storage use
  `.with(multiAdminStorage)`

Below is the list of combinators that specify what kind of tokens the contract
holds. They do not add methods that can be used by the client but influence
how the subsequent methods like `withMint`, `withBurn` will work and what
parameters they take.

* `.asNft` - specify that the contract represent **NFT**. To initialize the
  storage use `with(nftStorage)`

* `.asFungible` - specify that the contract represents a single **fungible
  tokens**. To initialize the storage use `with(fungibleTokenStorage)`

* `asMultiFungible` - specify that the contract represents multiple **fungible
  tokens** and it can have more that one type of tokens, specified by token ID.
  To initialize the storage use `with(multiFungibleTokenStorage)`

Below is the group of combinators that should be used on top of one of
the combinators from the previous group. You can find more
details about each method that they add to the contract
[here](src/interfaces/minter-combinators.ts#L17)

* `withMint` - specify that the contract can mint new tokens.

* `withBurn` - specify that the contract can burn (remove) previously
created tokens.

* `withFreeze` - specify that the contract can freeze the collation, after
  certain number of tokens is created. To initialize the storage use
  `with(mintFreezeStorage)`.

There is also `withMultiMinterAdmin` that allows to add and remove addresses
that can mint and burn token. [Here](src/interfaces/minter-admin.ts) are the
details. To initialize the storage for it use `with(multiMinterAdminStorage)`.

Also, `withFa2` adds the methods specified by
[TZIP12 standard](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md)
that every FA2 contract supposed to have. You can find the details
[here](src/interfaces/fa2.ts#L135)

Here is an examples a complete examples:

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

In the above example we create an NFT contract that can mint, burn, freeze, that
is pausable, and allows to use methods specified by FA2. If you need to
initialize the storage for it you can do:

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

If a custom contract and API to it is necessary, it can be accessed in
a type-safe way using very little boilerplate.  The new API can be
implemented just by providing one constructor function with the following
signature:

```typescript
<T>(contract: Tzip12Contract, lambdaView?: address) => T
```

The `T` type here is just an object(a record of functions) and can be
implemented anyway possible, including using a TypeScript class. In this case
it has to be wrapped in a function like this:

```typescript
export const MyContractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): Fa2Contract => new MyClass(contract, lambdaView)
```

Now, you can extends your contract abstraction with generic `.with` combinator:

```typescript
const myContractApi = contract.with(MyContractApi)
```

myContractApi object will have all the API methods defined by MyClass.

### Executing Multiple Operations in One Batch

While you can send information about multiple tokens in one `mint` call, send
batch in one call to `transferTokens` as well as `updateOperators`, sometimes
you might want to send multiple requests in one batch that deal with different
contracts or use unrelated methods (actions) of one contract. That can be done
using [Taquito](https://tezostaquito.io/) batch. We have a helper method
`runBatch` in order to simplify sending batch and waiting for its confirmation.

Here is an example:

```typescript
const batch = toolkit.contract.batch();

batch.withContractCall(fa2Contract1.transferTokens(txs1));
batch.withContractCall(fa2Contract1.transferTokens(txs2));
const op: BatchOperation = await fa2.runBatch(batch);
```

For more information, please look [here](src/taquito-run.ts#27)
