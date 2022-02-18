# Content

This document describes how to use TypeScript/JavaScript FA2 API build on top of
[Taquito](https://tezostaquito.io/). It simplifies operations required to work
with NFT (Non-Fungible Token), Fungible Tokens and, when TypeScript is used,
provide a type-safe API to the contracts.

## Table of Contents

* [How to Mint an NFT](#metadata-validation)

### How to Mint an NFT

This tutorial assumes that the collection is already created. The collection
is represented by your smart contract on Tezos blockchain and by minting an NFT you
call your smart contract and ask to add a new token into the storage of the contract.
The creation of the contract and its origination is out of scope fo this tutorial.

In order to create a token, you first need to create a metadata in JSON format.
It can look like this:

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
  "artifactUri": "myuri",
  "displayUri": "myuri",
  "thumbnailUri": "myuri",
  "creators": [],
  "rights": "",
  "attributes": [
    {
      "name": "sample attribute",
      "value": "sample value"
    }
  ]
}
```

The artifact itself is usually kept on
[IPFS](https://docs.ipfs.io/concepts/what-is-ipfs/) and metadata references its
URI. There can be separate URIs for display and thumbnail if it is an
image. The format of metadata should confirm to
[TZIP-21](https://gitlab.com/tezos/tzip/-/tree/master/proposals/tzip-21) 
standard and it is a good idea to validate it before creation. To validate
you can do:

```typescript
import { validateTzip16 } from '@oxheadalpha/fa2-interfaces';

const meta = JSON.parse(metaJson);
const validationResults = validateTzip21(meta);
const errorsOnly = validationResults.filter(r => r.startsWith('Error:'));
```

If it passed the validation the next step will be to create it. Before anything
else can be done an object that represents your contract (Collection) has to
be created. As it is a wrapper around [Taquito](https://tezostaquito.io/), first
we will need to create Taquito `TezosToolkit`.

```typescript
const tzt = new TezosToolkit(...);
const myContract = await tezosApi(tz).at(contractAddress)
```

Next you would want to specify what kind of contract you
have by using combinators on `myContract`.

```typescript
const fa2Contract = myContract.asNft().withMint()
```

As depending on the type of token method can have different implementation
you have to specify type of token `asNft` and then methods you would like 
to use `withMint`. From this point you can call you contract and TypeScript
will validated method and parameters at compile time.

Here is how you would create your NFT token:

