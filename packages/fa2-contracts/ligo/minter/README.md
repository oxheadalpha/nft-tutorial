# Minter Module

Each minter module implementation corresponds to a particular token module implementation.
The minter implementation is controlled by three following flags:

* `CAN_MINT` the contract can mint new tokens.
* `CAN_BURN` the contract can burn tokens supply.
* `CAN_FREEZE` the contract is frozen and no tokens can be minted or burnt.

## Module Signature

```ocaml
type minter_storage = ...
```

Minter storage type.

```ocaml
type minter_entrypoints = ...
```

Minter entry points type.

```ocaml
let minter_main (param, tokens, minter
  : minter_entrypoints * token_storage * minter_storage)
  : token_storage * minter_storage 
```

Implementation of the minter logic.
