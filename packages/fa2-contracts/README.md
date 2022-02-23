# Content

[LIGO](https://ligolang.org/) library of reusable modules to implement FA2
contracts.

## Table of Contents

* [tzGen CLI Tool](#tzgen-cli-tool)
* [Cameligo Modules](#cameligo-modules)
  * [Common LIGO Admin Module Signature](#common-ligo-admin-module-signature)
  * [Common LIGO Minter Admin Module Signature](#common-ligo-minter-admin-module-signature)

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
