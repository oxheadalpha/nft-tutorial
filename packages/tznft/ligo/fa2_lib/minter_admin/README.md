# Contract Minter Admin Module

Reusable implementation  of the contract minter administrator. Minter administrator
has rights to mint and burn tokens if the FA2 contract supports such functionality.

## Module Signature

```ocaml
type storage = ...
```

Type of the minter admin storage.

```ocaml
type entrypoints = ...
```

Type of the minter admin entry points.

```ocaml
let is_minter (storage : storage) : bool = ...
```

Minter guard function that returns `true` if a sender is a minter admin.

```ocaml
let main(param, storage : entrypoints * storage)
    : (operation list) * storage = ...
```

Implementation of the minter admin entry points defined by the `entrypoints`
type.
