# FA2 NFT Tutorial

This tutorial shows how to originate and interact with the FA2 NFT contract
implementation. The tutorial uses pre-compiled FA2 NFT contract written in
[LIGO](https://ligolang.org/) smart contract language and command line interface
(CLI) to originate and interact with the NFT contracts either on the
[Flextesa](https://tezos.gitlab.io/flextesa/) sandbox or Tezos testnet (Carthagenet).

## Introduction

### What is FA2

FA2 refers to a token standard ([TZIP-12](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md))
on Tezos. FA2 proposes a unified token contract interface, supporting a wide range
of token types. The FA2 provides a standard API to transfer tokens, check
token balances, manage operators (addresses that are permitted to transfer tokens
on behalf of the token owner) and manage token metadata.

### What is NFT

NFT (non-fungible token) is a special type of cryptographic token which represents
something unique; non-fungible tokens are thus not mutually interchangeable.
NFTs can represent ownership over digital or physical assets like virtual collectibles
or unique art work.

For each individual non-fungible token, the FA2 assigns a unique
token ID and associates it with the token owner address. The FA2 API allows to
inspect token balances for the specific token ID and token owner address. For NFTs
the balance can be either 0 (which means that the address does not own this particular
token) or 1 (the address owns the token).

The FA2 contract also associates some metadata with each token. This tutorial supports
token symbol and token name metadata attributes. However, the implementation can
be easily extended to support custom metadata attributes such an associated image
or document URL and its crypto-hash.

## Tutorial

### Prerequisites

- [Node.js](https://nodejs.org/) must be installed. Node installation must also
  include `npm` (Node package manager).

- [Docker](https://www.docker.com/) must be installed. You need docker to run
  Flextesa sandbox. You might skip docker installation if you plan to run this
  tutorial on the testnet (Carthagenet) only.

### The CLI Tool

You will need to install `tznft` CLI tool. After the installation, you can invoke
various commands in the form of `tznft <command> [options]`. `tznft` provides the
following commands:

- NFT mint (contract origination) and token inspection command
- NFT transfer command
- Configuration commands to bootstrap Tezos network and configure address aliases

The commands will be explained in more details below. You can always run

```sh
$ tznft --help
```

to list all available commands.

### Initial Setup

1. Create a new local directory to keep your tutorial configuration:

   ```sh
   $ mkdir nft-tutorial
   $ cd nft-tutorial
   ```

2. Install `@tztezos/nft-tutorial` npm package:

   ```sh
   $ npm install -g https://github.com/tqtezos/nft-tutorial.git

   /usr/local/bin/tznft -> /usr/local/lib/node_modules/@tqtezos/nft-tutorial/lib/tznft.js

   + @tqtezos/nft-tutorial@1.0.0
   added 3 packages from 1 contributor and updated 145 packages in 11.538s
   ```

   The command installs `tznft` CLI tool.

3. Initialize tutorial config:

   ```sh
   $ tznft config-init

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

   ebb03733415c6a8f6813a7b67905a448556e290335c5824ca567badc32757cf4

   starting sandbox...
   sandbox started
   originating balance inspector contract...
   originated balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
   ```

   If you are bootstrapping `sandbox` network first time, Docker will download
   Flextesa sandbox image as well.

   Default configuration comes with two bootstrap aliases `bob` and `alice` that
   can be used for token minting and transferring.

### Mint NFT Token(s)

This tutorial uses NFT collection contract. When the user mints a new set (collection)
of tokens, a new NFT contract is created. The use cannot add more tokens or remove
(burn) existing tokens within the contract. However tokens can be transferred to
other owners.

To originate a new NFT collection you need to provide the following parameters:

- token owner
- `--tokens` new tokens metadata. Each token metadata is represented as comma
  delimited string: `'<token_id>, <token_symbol>, <token_name>'`:

```sh
$ tznft mint <owner_alias> <token_meta_list>`
```

Example:

```sh
$ tznft mint bob --tokens '0, T1, My Token One' '1, T2, My Token Two'

originating new NFT contract...
originated NFT collection KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh
```

### Inspecting The NFT Contract

Using `KT1..` address of the NFT contract created by the `mint` command, we can
inspect token metadata and balances (i. e. what addresses own the tokens).

#### Inspect Token Metadata

`show-meta` command requires the following parameters:

- `--nft` address of the FA2 NFT contract to inspect
- `--operator` alias on behalf of which contract is inspected
- `--tokens` a list of token IDs to inspect

```sh
$ tznft show-meta --nft <nft_address> --operator <alias> --tokens <token_id_list>
```

Example:

```sh
$ tznft show-meta --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --tokens 0 1

token_id: 0	symbol: T1	name: My Token One	extras: { }
token_id: 1	symbol: T2	name: My Token Two	extras: { }
```

#### Inspect Token Balances

`show-balance` command requires the following parameters:

- `--nft` address of the FA2 NFT contract to inspect
- `--operator` alias on behalf of which contract is inspected
- `--owner` alias of the token owner to check balances
- `--tokens` a list of token IDs to inspect

```sh
$ tznft show-balance --nft <nft_address> --operator <alias> --owner <alias> --tokens <token_id_list>
```

Example 1, check `bob`'s balances:

```sh
$ tznft show-balance --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --owner bob --tokens 0 1

querying NFT contract KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh using balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
requested NFT balances:
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 0	balance: 1
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 1	balance: 1
```

Example 2, check `alice` balances:

```sh
$ tznft show-balance --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --owner alice --tokens 0 1

querying NFT contract KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh using balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
requested NFT balances:
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 0	balance: 0
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 1	balance: 0
```

## Transferring Tokens

`transfer` command requires the following parameters:

- `--nft` address of the FA2 NFT contract that holds tokens to be transferred
- `--operator` alias or address that initiates transfer operation
- `--batch` a list of individual transfers. Each individual transfer is represented
  as a comma delimited string: `<from_address_or_alias>, <to_address_or_alias>, <token_id>`.
  We do not need to specify amount of the transfer for NFTs since we can only
  transfer a single token for any NFT type.

```sh
$ tznft transfer --nft <nft_address> --operator <operator> --batch <batch_list>`
```

Example, `bob` transfers his own tokens `0` and `1` to `alice`:

```sh
$ tznft transfer --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --batch 'bob, alice, 0' 'bob, alice, 1'

transferring tokens...
tokens transferred
```

Now, we can check token balances after the transfer:

```sh
$ tznft show-balance --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --owner bob --tokens 0 1

querying NFT contract KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh using balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
requested NFT balances:
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 0	balance: 0
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 1	balance: 0

$ tznft show-balance --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --owner alice --tokens 0 1

querying NFT contract KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh using balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
requested NFT balances:
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 0	balance: 1
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 1	balance: 1
```

### Operator transfer

It is also possible to transfer tokens on behalf of the owner.

`bob` is trying to transfer one of the `alice` tokens back:

```sh
$ tznft transfer --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --batch 'alice, bob, 1'

transferring tokens...
Tezos operation error: FA2_NOT_OPERATOR
```

As we can see, this operation has failed. The default behavior of the FA2 token
contract is to allow only token owners to transfer their tokens. In our example,
bob (as operator) tries to transfer token `1` that belongs to `alice`.

However, `alice` can add `bob` as an operator to allow him transfer any tokens on
behalf of `alice`.

`update-ops` command has the following parameters:

- `<owner>` alias or address of the token owner to update operators for
- `--nft` address of the FA2 NFT contract
- `--add` list of aliases or addresses to add to the operator set
- `--add` list of aliases or addresses to remove the operator set

```sh
$ tznft update-ops <owner> --nft <nft_address> --add [add_operators_list] --remove [add_operators_list]
```

Example, `alice` adds `bob` as an operator:

```sh
$ tznft update-ops alice --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --add bob

updating operators...
updated operators
```

Now `bob` can try to transfer a token on behalf of `alice` again:

```sh
$ tznft transfer --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --batch 'alice, bob, 1'

transferring tokens...
tokens transferred
```

Inspecting balances after the transfer:

```sh
$ tznft show-balance --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --owner bob --tokens 0 1

querying NFT contract KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh using balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
requested NFT balances:
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 0	balance: 0
owner: tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU	token: 1	balance: 1

$ tznft show-balance --nft KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh --operator bob --owner alice --tokens 0 1

querying NFT contract KT1XP3RE6S9t44fKR9Uo5rAfqHvHXu9Cy7fh using balance inspector KT1Pezr7JjgmrPcPhpkbkH1ytG7saMZ34sfd
requested NFT balances:
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 0	balance: 1
owner: tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb	token: 1	balance: 0
```

Token `1` now belongs to `bob`.

### Configuration

6. Select Tezos network. Either testnet `tznft set-network testnet` or a local
   sandbox (Flextesa) `tznft set-network sandbox`. You can always inspect selected
   net by running command `tznft show-network`. By default, a sandbox network
   is selected

7. Each network comes with two pre-configured aliases `bob` and `alice`. The user
   can manage the aliases by directly editing `tznft.json` or using
   the following commands:

   - `tznft show-alias <alias>`, `npx show-alias --all`

   - `tznft add-alias <alias> <pk>`
   - `tznft remove-alias <alias>`

8. You need to start a sandbox before you can originate the contracts:
   `tznft start`

### TBD

- Modifying NFT Contract Code
- Extending token metadata
