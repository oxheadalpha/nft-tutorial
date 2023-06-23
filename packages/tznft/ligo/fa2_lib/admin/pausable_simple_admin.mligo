#if !PAUSABLE_SIMPLE_ADMIN
#define PAUSABLE_SIMPLE_ADMIN

#include "./admin_sig.mligo"

module Admin : AdminSig = struct

  type storage = {
    admin : address;
    pending_admin : address option;
    paused : bool;
  }
  type entrypoints =
    | Set_admin of address
    | Confirm_admin of unit
    | Pause of bool

  let confirm_new_admin (storage : storage) : storage =
    match storage.pending_admin with
    | None -> (failwith "NO_PENDING_ADMIN" : storage)
    | Some pending ->
      if Tezos.get_sender () = pending
      then { storage with
        pending_admin = (None : address option);
        admin = Tezos.get_sender ();
      }
      else (failwith "NOT_A_PENDING_ADMIN" : storage)
    
  (* Fails if sender is not admin *)
  let fail_if_not_admin_ext (storage, extra_msg : storage * string) : unit =
    if Tezos.get_sender () <> storage.admin
    then failwith ("NOT_AN_ADMIN" ^  " "  ^ extra_msg)
    else unit

  (* Fails if sender is not admin *)
  let fail_if_not_admin (storage : storage) : unit =
    if Tezos.get_sender () <> storage.admin
    then failwith "NOT_AN_ADMIN"
    else unit

  (* Returns true if sender is admin *)
  let is_admin (storage : storage) : bool =
    Tezos.get_sender () = storage.admin

  let fail_if_paused (storage : storage) : unit =
    if(storage.paused)
    then failwith "PAUSED"
    else unit

  (*Only callable by admin*)
  let set_admin (new_admin, storage : address * storage) : storage =
    let _ = fail_if_not_admin storage in
    { storage with pending_admin = Some new_admin; }
      
  (*Only callable by admin*)
  let pause (paused, storage: bool * storage) : storage =
    let _ = fail_if_not_admin storage in
    { storage with paused = paused; }

  let main(param, storage : entrypoints * storage) : (operation list) * storage =
    match param with
    | Set_admin new_admin ->
        let new_s = set_admin (new_admin, storage) in
        (([] : operation list), new_s)

    | Confirm_admin _ ->
        let new_s = confirm_new_admin storage in
        (([]: operation list), new_s)

    | Pause paused ->
        let new_s = pause (paused, storage) in
        (([]: operation list), new_s)
end

#endif