# Content

This document describes how to use TypeScript/JavaScript FA2 API build on top of
[Taquito](https://tezostaquito.io/). It simplifies operations required to work
with NFT (Non-Fungible Token), Fungible Tokens and, when TypeScript is used,
provide a type-safe API to the contracts.

This tutorial assumes that the collection is already created. The collection
is represented by your smart contract on Tezos blockchain and by minting an NFT you
call your smart contract and ask to add a new token into the storage of the contract.
Contact origination (collection creation) is out of scope fo this tutorial.

## Table of Contents

* [Creating Token Metadata](a)
* [Type-Safe Contract Abstraction](a)
* [Minting](a)
* [Transferring Tokens](a)
* [Update Operators](a)

### Creating Token Metadata

In order to create a token, we first need to create a token metadata.
Token metadata has to confirm to
[TZIP-21](https://gitlab.com/tezos/tzip/-/tree/master/proposals/tzip-21).

There are two ways to create a metadata for your token: **on-chain** and
**off-chain**. Artifact itself is always kept off-chain, usually in
[IPFS](https://docs.ipfs.io/concepts/what-is-ipfs/). However, the attributes
off the token can be kept either **on-chain** or **off-chin**.

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
  "artifactUri": "/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "displayUri": "/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "thumbnailUri": "/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
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

Before creating **off-chain** metadata it should be create in JSON format
and uploaded to IPFS. Then, **off-chain** metadata can be created using a
helper function:

```typescript
const tokenMetadata = createOffChainTokenMetadata(
  1, // Token ID
  '/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' // IPFS URI
)
```

Now we are ready to interact with our contract.

### Type-Safe Contract Abstraction

Before anything else can be done, an object that represents your contract (Collection)
has to be created. As it is a wrapper around [Taquito](https://tezostaquito.io/), first
we will need to create Taquito `TezosToolkit`.

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
to mint NFTs) and then methods you would like to use by using `withMint()`.
TypeScript will infer the right type of `nftContract` and validated method
and parameters at compile time. Now you are ready to interact with your
contract.

### Minting

Minting (creating a new token) can be done by calling method `mint` like this:

```typescript
const op: TransactionOperation = await fa2.runMethod(
  nftContract.mint([
    { 
      owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', 
      tokens: [tokenMetadata1, tokenMetadata2] }
  ])
);
```

In order to save gas `mint` accepts lists to be able to bundle multiple token
creation into one request. In FA2 API methods that call/invoke contract entry
points return `Taquito` type `<ContractMethod<ContractProvider>>`.These methods
can be sent and confirmed individually, or in a batch, directly using Taquito
API. However, as it is a frequently used operations we have two helpers:
`runMethod` & `runBatch`

To make sure that the token was create method `hasNftTokens` can be used.

```typescript
const results = fa2.hasNftTokens([
  { owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', token_id: 1 },
  { owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU', token_id: 2 }
]);

const allGood = results.every(r => r === true)
```

### Transferring Token Ownership

Token ownership can be transferred using method `transferTokens`. This methods
takes a list of transfers and executes them. Transfers can be constructed
manually but it is easier to use "Transfers Batch API" to do that. It will
merge automatically subsequent transaction from the same source in order
to optimise gas. Here is how it can be done:

```typescript
const transfers = transferBatch()
  .withTransfer('tzFromAccount1', 'tzToAccount1', 1 /* tokenId */, 1 /* amount */)
  .withTransfer('tzFromAccount1', 'tzToAccount2', 2 /* tokenId */, 1 /* amount */)
  .transfers;

const op = await fa2.runMethod(fa2Contract.transferTokens(transfers));
```

For NFT tokens the amount should always be 1.

### Update Operators


