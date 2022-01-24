# Tutorial: Non-Fungible Tokens on Tezos Using FA2

This tutorial shows how to originate and interact with the FA2 NFT contract.
The tutorial uses an FA2 NFT contract written in [LIGO](https://ligolang.org/)
smart contract language and a command line interface (CLI) to originate and
interact with the NFT contracts either on the
[Flextesa](https://tezos.gitlab.io/flextesa/) sandbox or Tezos testnet (Hangzhou2net).

**Disclaimer:** We highly recommend users to take necessary precautions before
following this tutorial and interacting with experimental technology. Use this
tutorial at your own risk.

## Table of Contents

- [Introduction](#introduction)
  - [What is FA2 (TZIP-12)?](#what-is-fa2-tzip-12)
  - [What is a Non-Fungible Token (NFT)?](#what-is-a-non-fungible-token-nft)
- [Tutorial](#tutorial)
  - [Prerequisites](#prerequisites)
  - [The CLI Tool](#the-cli-tool)
  - [Initial Setup](#initial-setup)
  - [Create NFT Collection](#create-nft-collection)
    - [Prepare NFT Collection Metadata](#prepare-nft-collection-metadata)
    - [Originate NFT Collection Contract](#originate-nft-collection-contract)
    - [Prepare Tokens Metadata](#prepare-tokens-metadata)
    - [Pin Tokens Metadata on IPFS](#pin-tokens-metadata-on-ipfs)
    - [Mint Tokens](#mint-tokens)
  - [Inspect The NFT Contract](#inspect-the-nft-contract)
    - [Inspect Token Metadata](#inspect-token-metadata)
    - [Inspect Token Balances](#inspect-token-balances)
  - [Transfer Tokens](#transfer-tokens)
  - [Operator Transfer](#operator-transfer)
  - [Configuration](#configuration)
    - [Network Configuration Commands](#network-configuration-commands)
    - [Alias Configuration Commands](#alias-configuration-commands)

## Introduction

### What is FA2 (TZIP-12)?

FA2 refers to a token standard
([TZIP-12](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md))
on Tezos. FA2 proposes a unified token contract interface, supporting a wide range
of token types. The FA2 provides a standard API to transfer tokens, check
token balances, manage operators (addresses that are permitted to transfer tokens
on behalf of the token owner) and manage token metadata.

### What is a Non-Fungible Token (NFT)?

An NFT (non-fungible token) is a special type of cryptographic token which represents
something unique; non-fungible tokens are thus not mutually interchangeable.
NFTs can represent ownership over digital or physical assets like virtual collectibles
or unique artwork.

For each individual non-fungible token, the FA2 assigns a unique
token ID and associates it with the token owner address. The FA2 API enables the
inspection of token balances for the specific token ID and token owner address.
For NFTs the balance can be either 0 (which means that the address does not own
this particular token) or 1 (the address owns the token).

To enable discovery of the token contracts and tokens by indexers, wallets,
market places and other DApps, the FA2 contract also associates some metadata with
each token. At least, each token metadata has the name attribute. However, it is
also possible to provide extended metadata such as an associated image or document
URL and its crypto-hash. The metadata format is described in
[TZIP-12](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata)
and [TZIP-21](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-21/tzip-21.md)
(rich metadata) standards.

## Tutorial

### Prerequisites

- [Node.js](https://nodejs.org/) must be installed. The Node installation must also
  include `npm` (Node package manager).

- [Docker](https://www.docker.com/) must be installed. You need docker to run
  Flextesa sandbox. You might skip docker installation if you plan to run this
  tutorial on the testnet (Hangzhou2net) only.

### The CLI Tool

You will need to install `tznft` CLI tool. After the installation, you can invoke
various commands in the form of `tznft <command> [options]`. `tznft` provides the
following command categories:

- configuration and bootstrapping Tezos network and configure address aliases
- generate and validate NFT collections and tokens metadata
- create NFT collection (FA2 contract origination) and mint tokens
- token inspection
- token transfer
- pin files and directories to [Pinata](https://www.pinata.cloud/) IPFS server

The commands will be explained in more detail below. You can always run

```sh
$ tznft --help
```

to list all available commands.

### Initial Setup

1. Install `@oxheadalpha/tznft` npm package:

   ```sh
   $ npm install -g @oxheadalpha/tznft

   ```

   The command installs `tznft` CLI tool.

2. Create a new project directory to keep your project configuration and other files:

   ```sh
   $ mkdir nft-tutorial
   $ cd nft-tutorial
   ```

3. Initialize tutorial project:

   ```sh
   $ tznft init

   tznft.json config file created
   ```

4. Check that the default active network is `sandbox`:

   ```sh
   $ tznft show-network

   active network: sandbox
   ```

5. Bootstrap Tezos network:

   ```sh
   $ tznft bootstrap

   ea4b3e3c52c37214344cbd82988c475f84125546ca6534c0ce870582e688ca18

   starting sandbox...
   connecting to Tezos node rpc...
   connecting to Tezos node rpc...
   connecting to Tezos node rpc...
   connecting to Tezos node rpc...
   connecting to Tezos node rpc...
   sandbox started
   originating Taquito lambda view contract...
   originated Taquito lambda view KT1BEZKvYrXY74RNcYyL1BWEqDuyETGdccB5
   ```

   If you are bootstrapping a `sandbox` network for the first time, Docker will
   download the Flextesa docker image as well.

   The default configuration comes with two account aliases `bob` and `alice`
   that can be used for token minting and transferring.

   The `bootstrap` command starts and initializes a sandbox. If you are using
   `testnet` or `mainnet` Tezos networks, `bootstrap` command has no effect and
   can be skipped.

### Create NFT Collection

To create a new NFT collection (FA2 contract) we would follow the steps bellow:

1. Prepare collection (FA2 contract) metadata.
2. Create a collection (originate a contract).
3. Prepare tokens metadata.
4. Pin tokens metadata on IPFS
5. Mint tokens.

#### Prepare NFT Collection Metadata

`create-collection-meta` command generates a new contract metadata JSON file and
requires `<collection_name>` parameter.

```sh
$ tznft create-collection-meta <collection_name>
```

Example:

```sh
$ tznft create-collection-meta my_collection

Created collection metadata file my_collection.json
```

`my_collection.json` file contains a template for the collection contract metadata:

```json
{
  "name": "my_collection",
  "description": "Awesome NFT collection",
  "homepage": "https://github.com/oxheadalpha/nft-tutorial",
  "authors": [
    "John Doe <john.doe@johndoe.com>"
  ],
  "version": "1.0.0",
  "license": {
    "name": "MIT"
  },
  "interfaces": [
    "TZIP-016",
    "TZIP-012",
    "TZIP-021"
  ],
  "source": {
    "tools": [
      "LIGO"
    ],
    "location": "https://github.com/oxheadalpha/nft-tutorial"
  }
}
```

You can edit the file before using it to originate a collection contract. Please
refer to the contract metadata
[TZIP-16](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-16/tzip-16.md)
and [FA2 Contract Metadata](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#contract-metadata-tzip-016)
standards for more details.

`validate-collection-meta` command validates contract metadata JSON and requires
the following parameters:

- `<metadata_file>` path to a metadata JSON file
- `--errors-only` optional flag to suppress validation warning messages

Example:

```sh
$ tznft validate-collection-meta my_collection.json

Warning: It looks like "description" has a sample value. Replace with a real description or remove it
Warning: It looks like "homepage" has a sample value. Replace with a real URL or remove it
Warning: It looks like one of the authors is a sample 'John Doe <john.doe@johndoe.com>'. Replace with a real author e-mail or URL or remove it
```

#### Originate NFT Collection Contract

`create-collection` command originates FA2 collection contract and requires the
following parameters:

- `<owner>` alias or address of the new collection owner
- `--meta_file <file>`  path to a new collection metadata file
- `--alias <alias>` optional alias for a new collection contract address

```sh
$ tznft create-collection <owner> --meta_file <file> --alias <alias>
```

Example:

```sh
$ tznft create-collection bob --meta_file my_collection.json --alias my_collection

originating new NFT contract...
originated contract nft with address KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
consumed gas: 2799
alias my_collection has been added
```

You can inspect newly created contract using [TZComet](https://tzcomet.io/)
or [BCD](https://better-call.dev/) contract explorers by copying and pasting a new
contract address. TZComet can automatically discover a contract on either Tezos
mainnet, testnet or a locally running sandbox. BCD can discover contracts on
mainnet and testnet only.

#### Prepare Tokens Metadata

`create-nft-meta` command generates a new token metadata JSON file and
requires the following parameters:

- `<nft_name>` name of the token
- `<creator>` alias or address of the NFT collection owner
- `<uri>` token artifact URI

```sh
$ tznft create-nft-meta <nft_name> <creator> <uri>
```

Token metadata can store a reference to some external document and/or image.
This tutorial supports storing external data on [IPFS](https://ipfs.io) and keeping
an IPFS hash as a part of the token metadata (which we will store on IPFS as well).

Let's create metadata for an NFT token which references an image on IPFS with the
hash code (CID)
[QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj](https://ipfs.io/ipfs/QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj).

Example:

```sh
$ tznft create-nft-meta Token1 bob ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj

Created token metadata sample file Token1.json
```

`Token1.json` file contains a template for the token metadata:

```json
{
  "decimals": 0,
  "isBooleanAmount": true,
  "name": "Token1",
  "description": "",
  "tags": [
    "awesome",
    "nft"
  ],
  "minter": "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
  "artifactUri": "ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj",
  "displayUri": "ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj",
  "thumbnailUri": "ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj",
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

You can edit the file before using it to mint an NFT and create multiple metadata
files per each token you intend to mint. You may edit generated and add many other
attributes. Please refer to the rich metadata
[TZIP-21](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-21/tzip-21.md)
standard for more details.

`validate-nft-meta` command validates token metadata JSON and requires the
following parameters:

- `<metadata_file>` path to a metadata JSON file
- `--errors-only` optional flag to suppress validation warning messages

Example:

```sh
$ tznft validate-nft-meta Token1.json

Warning: Property "description" has empty string value. Consider removing or provide a value for the property.
Warning: Property "rights" has empty string value. Consider removing or provide a value for the property.
Warning: It looks like "tags" property contains sample values "awsome", "nft". Remove or replace them with actual tag values
Warning: It looks like "attributes" property contains sample attribute. Remove or replace it with actual attributes
```

For this tutorial, we will mint two tokens. We will use two token metadata files
`Token1.json` and `Token2.json` derived from the generated template file. Both
tokens will share the same `artifactUri` and would have different names. Feel
free to customize tokens metadata as you see fit.
#### Pin Tokens Metadata on IPFS

Before minting tokens, you need to pin token metadata files to IPFS and use their
IPFS URIs for minting. There are multiple ways to do this, but in this tutorial
we will use [Pinata](https://www.pinata.cloud/). First, you need to create a
Pinata account (there is a free option available). You can upload (pin) `Token1.json`
and `Token2.json` files created on the previous step manually or use `tznft` CLI.

Create Pinata keys using Pinata's web UI. You would need an API key and a secret
key.

Execute `set-pinata-keys` command that requires the following parameters:

- `<pinata_api_key>` Pinata API key
- `<pinata_secret_key>` Pinata secret key
- `--force` optional flag to override existing keys in configuration if any

```sh
$ tznft set-pinata-keys <pinata_api_key> <pinata_secret_key> --force
```

Example:

```sh
$ tznft set-pinata-keys 38dxxx e9fxxx --force
38dxxx e9fxxx
Pinata keys have been added.
```

_Note: Pinata keys are stored in the `tznft.json` configuration file in your
project directory. Please you caution to not share your secret Pinata key._

Use `pin-file` command to pin token metadata files on Pinata IPFS service. Required
parameter:

- `<file>` path to a file to be pinned
- `--tag` IPFS tag (can be the same as file name)

```sh
$ tznft pin-file <file> --tag <tag>
```

Example:

```sh
$ tznft pin-file Token1.json --tag Token1

ipfs://QmfVUCoqRuR83Hhk9iJeobbqwDhdA1HLRGkbDQzdjHrezw

$ tznft pin-file Token2.json --tag Token2

ipfs://QmbAhKqNn9L3dP9pYoutsDq6UjqrjCTuJCNRkJDAF12GL8
```

There is also a similar command `pin-dir` to pin a whole directory on IPFS.

#### Mint Tokens

`mint` command requires the following parameters:

- `<owner>` alias or address of the nft collection owner.
- `<collection>` alias or address of the NFT collection contract created by
  `create-collection` command
- `--tokens` new token descriptors. Each token descriptor is a comma
  delimited string: `'<token_id>, <token_metadata_uri>'`:

```sh
$ tznft mint <owner_alias> <collection_alias> --tokens <tokens_list>
```

Example:

```sh
$ tznft mint bob my_collection --tokens '1, ipfs://QmfVUCoqRuR83Hhk9iJeobbqwDhdA1HLRGkbDQzdjHrezw' '2, ipfs://QmbAhKqNn9L3dP9pYoutsDq6UjqrjCTuJCNRkJDAF12GL8'

minting tokens...
tokens minted
```

Alternatively, you can use `mint-from-file` command to specify token descriptors
in a csv file instead of CLI. Required parameters:

- `<owner>` alias or address of the nft collection owner
- `<collection>` alias or address of the NFT collection contract created by
  `create-collection` command
- `--toke_file <file>` path to a file with definitions of new tokens

Let's create `tokens.csv` file as following:

```csv
3, ipfs://QmfVUCoqRuR83Hhk9iJeobbqwDhdA1HLRGkbDQzdjHrezw
4, ipfs://QmbAhKqNn9L3dP9pYoutsDq6UjqrjCTuJCNRkJDAF12GL8
```

and run `mint-from-file` command:

```sh
$ tznft mint-from-file bob my_collection --token_file tokens.csv

minting tokens...
tokens minted
```

You can mint multiple batches of tokens into the same NFT collection contract.
The only requirement is that token IDs must be unique.

Once, you finished populating your NFT collection you can freeze it (i. e. prevent
it from accepting more tokens).

`mint-freeze` command has the following parameters:

- `<owner>` alias or address of the nft collection owner
- `<collection>` alias or address of the NFT collection contract created by
  `create-collection` command

```sh
$ tznft mint-freeze <owner> <collection>
```

Example:

```sh
$ tznft mint-freeze bob my_collection

freezing nft collection...
nft collection frozen
```

Beware that freeze is a one way operation. Once a collection is frozen it is
impossible to "unfreeze" it and mint more tokens.


### Inspect The NFT Contract

Using `KT1..` address (or an address alias) of the NFT contract created by the
`create-collection` command, we can inspect token metadata and balances (i. e.
which addresses own the tokens).

#### Inspect Token Metadata

`show-meta` command requires the following parameters:

- `--nft` alias or address of the FA2 NFT contract to inspect
- `--tokens` a list of token IDs to inspect

```sh
$ tznft show-meta --nft <nft_address_or_alias> --tokens <token_id_list>
```

Example:

```sh
$ tznft show-meta --nft my_collection --tokens 1 2

querying token metadata...
{
  "token_id": 1,
  "decimals": 0,
  "isBooleanAmount": true,
  "name": "Token1",
  "description": "My awesome token",
  "tags": [
    "awesome",
    "nft"
  ],
  "minter": "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
  "artifactUri": "ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj",
  "attributes": [
    {
      "name": "sample attribute",
      "value": "sample value"
    }
  ]
}
{
  "token_id": 2,
  "decimals": 0,
  "isBooleanAmount": true,
  "name": "Token2",
  "description": "My awesome token",
  "tags": [
    "awesome",
    "nft"
  ],
  "minter": "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
  "artifactUri": "ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj",
  "attributes": [
    {
      "name": "sample attribute",
      "value": "sample value"
    }
  ]
}
```

Beware that IPFS might require some time to propagate the information about
pinned token metadata files. `show-meta` command may timeout if ran soon after
the token metadata was pinned.

#### Inspect Token Balances

`show-balance` command requires the following parameters:

- `--nft` alias or address of the FA2 NFT contract to inspect
- `--signer` alias or address on behalf of which contract is inspected
- `--owner` alias or address of the token owner to check balances
- `--tokens` a list of token IDs to inspect

```sh
$ tznft show-balance --nft <nft_address> --signer <alias> --owner <alias> --tokens <token_id_list>
```

Example 1, check `bob`'s balances:

```sh
$ tznft show-balance --nft my_collection --signer bob --owner bob --tokens 1 2

querying NFT contract KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
requested NFT balances:
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 1	balance: 1
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 2	balance: 1
```

Example 2, check `alice` balances:

```sh
$ tznft show-balance --nft my_collection --signer bob --owner alice --tokens 1 2

querying NFT contract KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
requested NFT balances:
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 1	balance: 0
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 2	balance: 0
```

### Transfer Tokens

`transfer` command requires the following parameters:

- `--nft` alias or address of the FA2 NFT contract that holds tokens to be transferred
- `--signer` alias or address that initiates the transfer operation
- `--batch` a list of individual transfers. Each individual transfer is represented
  as a comma delimited string: `<from_address_or_alias>, <to_address_or_alias>, <token_id>`.
  We do not need to specify amount of the transfer for NFTs since we can only
  transfer a single token for any NFT type.

```sh
$ tznft transfer --nft <nft_address> --signer <signer> --batch <batch_list>`
```

Example, `bob` transfers his own tokens `1` and `2` to `alice`:

```sh
$ tznft transfer --nft my_collection --signer bob --batch 'bob, alice, 1' 'bob, alice, 2'

transferring tokens...
tokens transferred
```

Now, we can check token balances after the transfer:

```sh
$ tznft show-balance --nft my_collection --signer bob --owner bob --tokens 1 2

querying NFT contract KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
requested NFT balances:
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 1	balance: 0
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 2	balance: 0

$ tznft show-balance --nft my_collection --signer bob --owner alice --tokens 1 2

querying NFT contract KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
requested NFT balances:
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 1	balance: 1
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 2	balance: 1
```

### Operator Transfer

It is also possible to transfer tokens on behalf of the owner.

`bob` is trying to transfer one of `alice`'s tokens back:

```sh
$ tznft transfer --nft my_collection --signer bob --batch 'alice, bob, 1'

transferring tokens...
Tezos operation error: FA2_NOT_OPERATOR
```

As we can see, this operation has failed. The default behavior of the FA2 token
contract is to allow only token owners to transfer their tokens. In our example,
bob (as an operator) tries to transfer token `1` that belongs to `alice`.

However, `alice` can add `bob` as an operator to allow him transfer any tokens on
behalf of `alice`.

`update-ops` command has the following parameters:

- `<owner>` alias or address of the token owner to update operators for
- `--nft` alias or address of the FA2 NFT contract
- `--add` list of pairs aliases or addresses and token id to add to the operator set
- `--remove` list of aliases or addresses and token id to remove from the operator set

```sh
$ tznft update-ops <owner> --nft <nft_address> --add [add_operators_list] --remove [add_operators_list]
```

Example, `alice` adds `bob` as an operator:

```sh
$ tznft update-ops alice --nft my_collection --add 'bob, 1'

updating operators...
updated operators
```

Now `bob` can transfer a token on behalf of `alice` again:

```sh
$ tznft transfer --nft my_collection --signer bob --batch 'alice, bob, 1'

transferring tokens...
tokens transferred
```

Inspecting balances after the transfer:

```sh
$ tznft show-balance --nft my_collection --signer bob --owner bob --tokens 1 2

querying NFT contract KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
requested NFT balances:
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 1	balance: 1
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 2	balance: 0

$ tznft show-balance --nft my_collection --signer bob --owner alice --tokens 1 2

querying NFT contract KT1FpmL3pDfq1rc6WsftCPr5wfHkMLGyyYyx
requested NFT balances:
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 1	balance: 0
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 2	balance: 1
```

Token `1` now belongs to `bob`.

### Configuration

`tznft` can be configured to interact with different Tezos networks. The user can
also configure address aliases to sign Tezos operations and/or use them as command
parameters when addresses are required. The default configuration that is created
by `tznft init` command includes two pre-configured networks: `sandbox`
and `testnet` (Hangzhou2net). Each pre-configured network has two bootstrap aliases:
`bob` and `alice`.

#### Network Configuration Commands

- `set-network <network>` select specified pre-configured network as an active one.
  All subsequent commands will operate on the active network

  Example:

  ```sh
  $ tznft set-network sandbox

  network sandbox is selected
  ```

- `show-network [--all]` show currently selected network. If `--all` flag is
  specified, show all pre-configured networks

  Example:

  ```sh
  $ tznft show-network --all

  * sandbox
    testnet
    mainnet
  ```

- `bootstrap` bootstrap sandbox and deploy helper Taquito view contract.
  If selected network is `sandbox` this command needs to be run each time sandbox
  is restarted. This command has no effect on other network types and can be skipped.

  Example:

  ```sh
  $ tznft bootstrap

  ea4b3e3c52c37214344cbd82988c475f84125546ca6534c0ce870582e688ca18

  starting sandbox...
  connecting to Tezos node rpc...
  connecting to Tezos node rpc...
  sandbox started
  originating Taquito lambda view contract...
  originated Taquito lambda view KT1BEZKvYrXY74RNcYyL1BWEqDuyETGdccB5
  ```

- `kill-sandbox` stop Flextesa sandbox process if selected network is `sandbox`.
  This command has no effect on other network types.

  Example:

  ```sh
  $ tznft kill-sandbox

  flextesa-sandbox

  killed sandbox.
  ```

The sandbox network (selected by default) is configured to bake new Tezos blocks
every 5 seconds. It makes running the commands that interact with the network
faster. However, all originated contracts will be lost after the sandbox is stopped.

If you are using `testnet`, your originated contracts will remain on the blockchain
and you can inspect them afterwards using an explorer like [BCD](https://better-call.dev/).

_Note: Although `testnet` configuration already has two bootstrap aliases `bob`
and `alice`, it is a good practice to create your own alias from the faucet file
(see `tznft add-alias-faucet` command described below) and use it as a signer for
the commands like `mint` and `transfer`. In this way, your Tezos
operations will not interfere with the operations initiated by other users._

#### Alias Configuration Commands

`tznft` allows user to configure and use short names (aliases) instead of typing
in full Tezos addresses when invoking `tznft` commands.
Each network comes with two pre-configured aliases `bob` and `alice`. The user
can manage aliases by directly editing `tznft.json` file or using the following
commands:

- `show-alias [alias]` show address and private key (if configured) of the
  specified `[alias]`. If `[alias]` option is not specified, show all configured
  aliases.

  Example:

  ```sh
  $ tznft show-alias bob

  bob	tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx

  $ tznft show-alias

  bob	tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx
  alice	tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq
  ```

- `add-alias <alias> <private_key>` add alias using its private key. Aliases
  that configured with the private key can be used to sign operations that
  originate or call smart contracts on chain. `tznft` commands that require Tezos
  operation signing have `--signer` option.

  Example:

  ```sh
  $ tznft add-alias jane edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq

  alias jane has been added

  $ tznft show-alias jane

  jane	tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq
  ```

  **Warning**: Your Tezos alias private key (along with other configuration) is
  stored in `tznft.json` file in the working directory. Use extreme caution when
  using private keys for the Tezos mainnet.

- `add-alias <alias> <address>` add alias using Tezos address (public key hash).
  Such aliases do not have associated private key and cannot be used to sign
  Tezos operations.

  Example:

  ```sh
  $ tznft add-alias michael tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb

  alias michael has been added

  $ tznft show-alias michael

  michael	tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
  ```

- `add-alias-faucet <alias> <faucet_json_file_path>` add alias with private key
  from the faucet file (see [Tezos Faucet](https://teztnets.xyz/)). This
  command will not work on `sandbox` network. An alias configured from the faucet
  has the private key and can be used to sign Tezos operations.

  Example:

  ```sh
  $ tznft add-alias-faucet john ~/Downloads/tz1NfTBQM9QpZpEY6GSvdw3XBpyEjLLGhcEU.json

  activating faucet account...
  faucet account activated
  alias john has been added

  $ tznft show-alias john

  john	tz1NfTBQM9QpZpEY6GSvdw3XBpyEjLLGhcEU	edskRzaCrGEDr1Ras1U55U73dXoLfQQJyuwE95rSkqbydxUS4oS3fGmWywbaVcYw7DLH34zedoJzwMQxzAXQdixi5QzYC5pGJ6
  ```

- `remove-alias <alias>` remove alias from the selected network configuration.

  Example:

  ```sh
  $ tznft remove-alias john

  alias john has been deleted
  ```

### TBD

- Support custom NFT contracts
- Support TZIP-16 off-chain views
