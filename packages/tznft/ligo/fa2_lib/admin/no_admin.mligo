(**
Definition of the admin module signature and implementation of the "no admin".
No admin - everyone is an admin
 *)

#if !NO_ADMIN
#define NO_ADMIN

#include "./admin_sig.mligo"

module Admin : AdminSig = struct

  type storage = unit
  type entrypoints = never

  (* Fails if sender is not admin*)
  [@inline]
  let fail_if_not_admin (_storage : storage) : unit = unit

  [@inline]
  let fail_if_not_admin_ext (_storage, _extra_msg : storage * string) : unit = unit

  (* Returns true if sender is admin *)
  [@inline]
  let is_admin (_storage : storage) : bool = true

  [@inline]
  let fail_if_paused (_storage : storage) : unit = unit

  let main(_param, storage : entrypoints * storage)
      : (operation list) * storage = ([] : operation list), storage

end

#endif


