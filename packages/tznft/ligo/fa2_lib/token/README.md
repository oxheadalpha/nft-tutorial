# Core FA2 Contract Module

Reusable implementation of the core FA2 contract functionality.

## Module Signature

```ocaml
type token_storage = ...
```

Token storage type.

```ocaml
let fa2_main (param, storage : fa2_entry_points * token_storage)
    : (operation  list) * token_storage = ...
```

Implementation of the FA2 contract entry points.
