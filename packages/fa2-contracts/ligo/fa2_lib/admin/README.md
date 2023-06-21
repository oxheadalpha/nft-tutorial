# Contract Admin Module

Reusable implementation  of the contract administrator

## Module Signature

```ocaml
type storage = ...
```

Admin storage type.

```ocaml
type entrypoints = ...
```

Admin entry points type type.

```ocaml
let fail_if_not_admin (storage : storage) : unit = ...
```

Admin guard function. Fails if a sender is not an admin.

```ocaml
let fail_if_not_admin_ext (storage, extra_msg : storage * string) : unit = ...
```

Extended admin guard function. Fails if a sender is not an admin with a custom
message.

```ocaml
let is_admin (storage : storage) : bool = ...
```

Admin guard function. Returns `true` if a sender is an admin.

```ocaml
let fail_if_paused (storage : storage) : unit = ...
```

A guard function that fails if the contract is paused.

```ocaml
let main(param, storage : entrypoints * storage)
    : (operation list) * storage = ...
```

Implementation of the admin entry points defined by the `entrypoints` type.
Admin privileged operations should be already guarded.
