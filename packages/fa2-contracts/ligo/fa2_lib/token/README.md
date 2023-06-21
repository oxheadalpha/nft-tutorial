# Core FA2 Contract Module

Reusable implementation of the core FA2 contract functionality.

## Module Signature

```ocaml
type ledger = ...
```

Token  ledger.

```ocaml
type token_storage = ...
```

Token storage type including ledger.

```ocaml
let fa2_main (param, storage : fa2_entry_points * storage)
    : (operation  list) * storage = ...
```

Implementation of the FA2 contract entry points.
