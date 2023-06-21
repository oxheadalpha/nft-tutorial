(**
Definition of the minter module signature and implementation of the "null minter".
Null minter - everyone can mint
 *)

#if !NULL_MINTER_ADMIN
#define NULL_MINTER_ADMIN

#include "minter_admin_sig.mligo"

module MinterAdmin : MinterAdminSig = struct

  type storage = unit
  type entrypoints = never

  (* True if sender is a minter *)
  [@inline]
  let is_minter (_storage : storage) : bool = true


  let main(_param, storage : entrypoints * storage) : (operation list) * storage =
    ([] : operation list), storage

end

#endif