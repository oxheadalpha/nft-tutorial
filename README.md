# FA2 NFT Tutorial

This tutorial shows how to originate and interact with the FA2 NFT contract
implementation. The tutorial uses pre-compiled FA2 NFT contract written in
[LIGO](https://ligolang.org/) smart contract language and command line interface
(CLI) to originate and interact with the NFT contracts either on the
[Flextesa sandbox](https://tezos.gitlab.io/flextesa/) or Tezos testnet (Carthagenet).

## Introduction

### What is FA2

FA2 refers to a token standard ([TZIP-12](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md))
on Tezos. FA2 proposes a unified token contract interface, supporting a wide range
of token types. The FA2 standard provides a standard API to transfer tokens, check
token balances,manage operators (an address that is permitted to manage tokens
on behalf of the token owner) and manage token metadata.

### What is NFT

NFT (non-fungible token) is a special type of cryptographic token which represents
something unique; non-fungible tokens are thus not mutually interchangeable.
NFTs can represent ownership over digital or physical assets like virtual collectibles
or unique art work.

For each individual non-fungible token the FA2 implementation assigns a unique
token ID and associates it with the token owner address. The FA2 API allows to
inspect token balances for the specific token ID and token owner address. For NFTs
the balance can be either 0 (which means that the address does not own this particular
token) or 1 (the address owns the token).

The FA2 contract also associates some metadata with each token. This tutorial supports
token symbol and token name metadata attributes. However, the implementation can
be easily extended to support custom metadata attributes such an associate image
or document URL and its crypto-hash.

## Tutorial

### Prerequisites

- [Node.js](https://nodejs.org/) must be installed. Node installation must also
  include `npm` (Node package manager)

- [Docker](https://www.docker.com/) must be installed. You need a docker to run
  Flextesa sandbox. You might skip docker installation if you plan to run this
  tutorial on the testnet (Carthagenet) only.

### Initial Setup

1. To install the tutorial run
   `npm install -g https://github.com/tqtezos/nft-tutorial.git`
   command.

2. Switch to your local tutorial directory and initialize tutorial config by running
   `tznft config-init`.

3. Select Tezos network. Either testnet `tznft set-network testnet` or a local
   sandbox (Flextesa) `tznft set-network sandbox`. You can always inspect selected
   net by running command `tznft show-network`. By default, a sandbox network
   is selected

4. Bootstrap the network by running `tznft bootstrap`.

5. Each network comes with two pre-configured aliases `bob` and `alice`. The user
   can manage the aliases by directly editing `tznft.json` or using
   the following commands:

   - `tznft show-alias <alias>`, `npx show-alias --all`

   - `tznft add-alias <alias> <pk>`
   - `tznft remove-alias <alias>`

6. You need to start a sandbox before you can originate the contracts:
   `tznft start`

## Originate NFT Collection(s)

To originate a new NFT collection you need to provide tokens metadata.
`tznft mint <owner_alias> <token_meta_list>`.

Example:

`tznft mint bob --tokens '0, T1, My Token' '1, T2, My Token'`

output:
`nft contract created: KT1SFWBwUSwmk2xd148Ws6gWUeASwK4UpFfP`

## Inspecting the NFT Contract

1. Check token ownership:
   `tznft show-balance --nft <nft> --owner <owner> --tokens <list_of_token_ids>`

Example:
`tznft --show-balance --nft KT1SFWBwUSwmk2xd148Ws6gWUeASwK4UpFfP --owner bob --tokens 0`

output:
`owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU token: 0 balance: 1`

2. Get token metadata: `tznft show-meta --nft <nft> --tokens <list_of_token_ids>`

Example:
`tznft show-meta --nft KT1SFWBwUSwmk2xd148Ws6gWUeASwK4UpFfP --tokens 0`

output: `token_id: 0 symbol: TZ0 name: token zero extras: { }`

## Transferring Tokens

1. Bob can transfer his own token to Alice:
   `tznft transfer --nft <nft> --operator <operator> --batch <batch_list>`

Example:
`tznft transfer --nft KT1SFWBwUSwmk2xd148Ws6gWUeASwK4UpFfP --operator bob --batch 'bob, alice, 0'`

2. It is also possible to transfer tokens on behalf of the owner.

- Alice adds Bob as an operator:
  `tznft update-operator <owner> --nft <nft> --add [add_list] --remove [remove_list]`

Example:
`tznft update-ops --nft KT1SFWBwUSwmk2xd148Ws6gWUeASwK4UpFfP alice -a bob`

- Now Bob can transfer Alice's token
  `tznft transfer --nft KT1SFWBwUSwmk2xd148Ws6gWUeASwK4UpFfP --operator bob --batch 'alice, bob, 0`

## Modifying NFT Contract Code

TBD

Customizing existing NFT contract
