# Contract Minter Admin Module

Reusable implementation  of the contract minter administrator. Minter administrator
has rights to mint and burn tokens if the FA2 contract supports such functionality.

## Module Signature

```ocaml
type minter_admin_storage = ...
```

Type of the minter admin storage.

```ocaml
type minter_admin_entrypoints = ...
```

Type of the minter admin entry points.

```ocaml
let is_minter (storage : minter_admin_storage) : bool = ...
```

Minter guard function that returns `true` if a sender is a minter admin.

```ocaml
let minter_admin_main(param, storage : minter_admin_entrypoints * minter_admin_storage)
    : (operation list) * minter_admin_storage = ...
```

Implementation of the minter admin entry points defined by the `minter_admin_entrypoints`
type.
