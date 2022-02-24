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
* [Cameligo Modules](#cameligo-modules)
  * [Common LIGO Admin Module Signature](#common-ligo-admin-module-signature)
  * [Common LIGO Minter Admin Module Signature](#common-ligo-minter-admin-module-signature)

## Modular Contracts

The FA2 interface is designed to support a wide range of token types and
implementations. The developer has to choose from multiple options when implementing
a specific FA2 contract. Besides choosing between fungible and non-fungible tokens,
a developer needs to decide weather new tokens can be minted and burned, how the
contract administrators can be set and what entry points should have admin access
only.

This package provides reusable contract modules implemented in
[CameLIGO](https://ligolang.org/) language that can be composed into a single FA2
contract. The developer can use either `tzGen` CLI tool or a programmatic API to
generate a final contract code. A generated FA2 contract is composed from several
orthogonal features. Each feature defines a set of possible options that can be
selected independently. A combination of selected options for all supported features
defines a specification describing a resulting FA2 contract behavior. Available
features and their options are described below.

### Token Kind

This feature defines kind of tokens supported by the FA2 contract. Available options
are listed below:

* `USE_NFT_TOKEN` - a contract implementation will support multiple non-fungible
  tokens
* `USE_FUNGIBLE_TOKEN` - a contract implementation will support a single fungible
  token
* `USE_MULTI_FUNGIBLE_TOKEN` - a contract implementation will support multiple
  fungible tokens

### Minter Functionality

This feature define optional support for token minting and burning. Multiple options
from the list can be selected at the same time. If none of the options are selected,
the resulting FA2 contract will not provide mint/burn functionality.

* `CAN_MINT` - a contract can mint new tokens
* `CAN_BURN` - a contract can burn tokens
* `CAN_FREEZE` - a contract can be frozen. Once an FA2 contract is frozen, no
  new tokens can be minted or burned (however, existing tokens still can be transferred).
  This option can be selected only if either `CAN_MINT` or `CAN_BURN` (or both)
  are selected.

### Contract Admin

A contract can define some privileged entry points that can be accessed by the
current contract admin address. There are several available options defining a
particular admin feature implementation:

* `USE_NO_ADMIN` - a contract will not have an admin. Every entry point can be
  invoked by any address.
* `USE_SIMPLE_ADMIN` - a contract will have a single admin.
* `USE_PAUSABLE_SIMPLE_ADMIN` - a contract will have a single admin. An admin can
  pause and unpause the contract (a paused contract cannot transfer its tokens).
* `USE_MULTI_ADMIN` - a contract can have multiple admins. An admin can pause and
  unpause the contract

### Minter Admin

This feature defines access to mint and burn functionality defined by the
[minter](#minter-functionality) feature.

* `USE_NULL_MINTER_ADMIN` - a contract will have no minter admin. If either
  `CAN_MINT` or `CAN_BURN` feature is selected, anyone can mint or burn tokens.
  This is also the default option if no mint or burn feature is selected.
* `USE_ADMIN_AS_MINTER` - a contract admin can also mint and burn tokens.
* `USE_MULTI_MINTER_ADMIN` - a contract can have multiple minter admins that can
  mint and burn tokens. Minter admin list is separate from the contract admin(s).

### Contract Specification Example

```
Token Kind (implementation): USE_NFT_TOKEN,
Minter: [CAN_MINT, CAN_FREEZE],
Admin: USE_PAUSABLE_SIMPLE_ADMIN
Minter Admin: USE_ADMIN_AS_MINTER
```

The resulting FA2 contract will support NFTs, be able to mint new tokens and freeze
the token collection after minting. The contract will have a simple (single) admin
that can pause and unpause it. Only the admin address will be able to mint tokens
and freeze the NFT collection.

## tzGen CLI Tool

## Cameligo Modules

* [fa2](./ligo/fa2_lib/fa2) FA2 interface and standard errors definition
* [fa2/lib](./ligo/fa2_lib/fa2/lib) helpers, various LIGO modules used for the
  FA2 implementation
  * [fa2/lib/fa2_operator_lib.mligo](./ligo/fa2_lib/fa2/lib/fa2_operator_lib.mligo)
    helper functions and storage to manage and validate FA2 operators
  * [fa2/lib/fa2_owner_hooks_lib.mligo](./ligo/fa2_lib/fa2/lib/fa2_owner_hooks_lib.mligo)
    helper functions to support sender/receiver hooks
* [token](./ligofa2_lib/fa2_lib/token) core implementation of the FA2 functionality
  and entry points for various token types
  * [token/fa2_nft_token.mligo](./ligo/fa2_lib/token/fa2_nft_token.mligo) core FA2
    implementation for NFT tokens (similar to Ethereum ERC-721)
  * [token/fa2_fungible_token.mligo](./ligo/fa2_lib/token/fa2_fungible_token.mligo)
    core FA2 implementation for a single fungible token (similar to Ethereum ERC-20)
  * [token/fa2_multi_fungible_token.mligo](./ligo/fa2_lib/token/fa2_multi_fungible_token.mligo)
    core FA2 implementation for multiple fungible tokens (similar to Ethereum ERC-1155)
* [minter](./ligo/fa2_lib/minter) implementation of mint and burn functionality.
  Each minter module corresponds to one of the `token` core implementation modules.
* [admin](./ligo/fa2_lib/admin) various implementations of the contract admin module.
  The admin may pause/unpause the contract and have access to other privileged
  contract entry points. Each admin implementation has a common LIGO module signature.
  * [admin/no_admin.mligo](./ligo/fa2_lib/admin/no_admin.mligo) implementation of
    the admin module where everyone is admin of the contract
  * [admin/simple_admin.mligo](./ligo/fa2_lib/admin/simple_admin.mligo)
    implementation of the admin module that has a single admin address; admin
    address can be changed.
  * [admin/pausable_simple_admin.mligo](./ligo/fa2_lib/admin/pausable_simple_admin.mligo)
    same as `simple_admin`, but lets pause/unpause the contract.
  * [admin/multi_admin.mligo](./ligo/fa2_lib/admin/multi_admin.mligo) implementation
    of the admin module that may have multiple admins; lets pause/unpause the
    contract and add/remove the admins
* [minter_admin](./ligo/fa2_lib/minter_admin) various implementations of the
  contract minter admin (minter is an address that has rights to mint new tokens).
  Each minter admin implementation has a common LIGO module signature.
  * [minter_admin/null_minter_admin.mligo](./ligo/fa2_lib/minter_admin/null_minter_admin.mligo)
    implementation of the minter admin module that allows everyone to mint new
    tokens
  * [minter_admin/multi_minter_admin.mligo](./ligo/fa2_lib/minter_admin/multi_minter_admin.mligo)
    implementation of the minter admin module that can have multiple addresses
    allowing to mint new tokens and add/remove new minters.

### Common LIGO Admin Module Signature

* `admin_storage` type of the admin storage (used as a part of the whole
  contract storage)
* `admin_entrypoints` type of the admin entry points
* `admin_main` implementation of the admin entry points (used by the contract
  main entry point)
* `is_admin`, `fail_if_not_admin`, `fail_if_not_admin_ext` functions to guard
  privileged operations in the contract implementation
* `is_paused` function to guard a paused contract

### Common LIGO Minter Admin Module Signature

* `minter_admin_storage` type of the minter admin storage (used as a part of the
  whole contract storage)
* `minter_admin_entrypoints` type of the minter admin entry points
* `minter_admin_main` implementation of the minter admin entry points (used by the
  contract main entry point)
* `is_minter` function to guard access to mint tokens operation(s)
