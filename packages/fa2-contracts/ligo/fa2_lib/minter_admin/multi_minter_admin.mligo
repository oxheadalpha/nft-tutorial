(**
Definition of the minter module signature and implementation of the "multiple minters".
There is a set of minter adresses that can mint tokens.
 *)

#if !NULL_MINTER_ADMIN
#define NULL_MINTER_ADMIN

#include "minter_admin_sig.mligo"

module MinterAdmin : MinterAdminSig = struct

  type storage = (address, unit) big_map
  type entrypoints =
    | Add_minter of address
    | Remove_minter of address

  (* True if sender is a minter *)
  [@inline]
  let is_minter (storage : storage) : bool =
    Big_map.mem (Tezos.get_sender ()) storage


  let main(param, storage : entrypoints * storage) : (operation list) * storage =
    match param with
    | Add_minter minter ->
      ([] : operation list), Big_map.add minter unit storage

    | Remove_minter minter ->
      ([] : operation list), Big_map.remove minter storage

end

#endif