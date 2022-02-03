# Content

[LIGO](https://ligolang.org/) library of reusable modules to implement FA2
contracts.

## Table of Contents

* [Scripts](#scripts)
* [Cameligo Modules](#cameligo-modules)
  * [Common LIGO Admin Module Signature](#common-ligo-admin-module-signature)
  * [Common LIGO Minter Admin Module Signature](#common-ligo-minter-admin-module-signature)

## LIGO

### Script

`export-ligo <my_ligo_sources_dir>` script exports common LIGO source code used
to create FA2 contracts.

Usage example:

```sh
$yarn export-ligo ./ligo
```

### Cameligo Modules

* [fa2](./ligo/fa2) FA2 interface and standard errors definition
* [fa2/lib](./ligo/fa2/lib) helpers, various LIGO modules used for the FA2 implementation
  * [fa2/lib/fa2_operator_lib.mligo](./ligo/fa2/lib/fa2_operator_lib.mligo)
    helper functions and storage to manage and validate FA2 operators
  * [fa2/lib/fa2_owner_hooks_lib.mligo](./ligo/fa2/lib/fa2_owner_hooks_lib.mligo)
    helper functions to support sender/receiver hooks
* [admin](./ligo/admin) various implementations of the contract admin module.
  The admin may pause/unpause the contract and have access to other privileged
  contract entry points. Each admin implementation has a common LIGO module signature.
  * [admin/no_admin.mligo](./ligo/admin/no_admin.mligo) implementation of the admin
    module where everyone is admin of the contract
  * [admin/simple_admin.mligo](./ligo/admin/simple_admin.mligo) implementation of
    the admin module that has a single admin address; lets pause/unpause the contract
    and change the admin
  * [admin/non_pausable_simple_admin.mligo](./ligo/admin/non_pausable_simple_admin.mligo)
    same as `simple_admin`, but without ability to pause/unpause the contract.
  * [admin/multi_admin.mligo](./ligo/admin/multi_admin.mligo) implementation of
    the admin module that may have multiple admins; lets pause/unpause the contract
    and add/remove the admins
* [minter_admin](./ligo/minter_admin) various implementations of the contract
  minter admin (minter is an address that has rights to mint new tokens). Each
  minter admin implementation has a common LIGO module signature.
  * [minter_admin/no_minter_admin.mligo](./ligo/minter_admin/no_minter_admin.mligo)
    implementation of the minter admin module that prevent everyone from minting
    new tokens
  * [minter_admin/null_minter_admin.mligo](./ligo/minter_admin/null_minter_admin.mligo)
    implementation of the minter admin module that allows everyone to mint
    new tokens
  * [minter_admin/multi_minter_admin.mligo](./ligo/minter_admin/multi_minter_admin.mligo)
    implementation of the minter admin module that can have multiple addresses
    allowing to mint new tokens and add/remove new minters.

#### Common LIGO Admin Module Signature

* `admin_storage` type of the admin storage (used as a part of the whole
  contract storage)
* `admin_entrypoints` type of the admin entry points
* `admin_main` implementation of the admin entry points (used by the contract
  main entry point)
* `is_admin`, `fail_if_not_admin`, `fail_if_not_admin_ext` functions to guard
  privileged operations in the contract implementation
* `is_paused` function to guard a paused contract

#### Common LIGO Minter Admin Module Signature

* `minter_admin_storage` type of the minter admin storage (used as a part of the
  whole contract storage)
* `minter_admin_entrypoints` type of the minter admin entry points
* `minter_admin_main` implementation of the minter admin entry points (used by the
  contract main entry point)
* `is_minter` function to guard access to mint tokens operation(s)
