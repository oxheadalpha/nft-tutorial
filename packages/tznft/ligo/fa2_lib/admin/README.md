# Contract Admin Module

Reusable implementation  of the contract administrator

## Module Signature

```ocaml
type admin_storage = ...
```

Admin storage type.

```ocaml
type admin_entrypoints = ...
```

Admin entry points type type.

```ocaml
let fail_if_not_admin (storage : admin_storage) : unit = ...
```

Admin guard function. Fails if a sender is not an admin.

```ocaml
let fail_if_not_admin_ext (storage, extra_msg : admin_storage * string) : unit = ...
```

Extended admin guard function. Fails if a sender is not an admin with a custom
message.

```ocaml
let is_admin (storage : admin_storage) : bool = ...
```

Admin guard function. Returns `true` if a sender is an admin.

```ocaml
let fail_if_paused (storage : admin_storage) : unit = ...
```

A guard function that fails if the contract is paused.

```ocaml
let admin_main(param, storage : admin_entrypoints * admin_storage)
    : (operation list) * admin_storage = ...
```

Implementation of the admin entry points defined by the `admin_entrypoints` type.
Admin privileged operations should be already guarded.
