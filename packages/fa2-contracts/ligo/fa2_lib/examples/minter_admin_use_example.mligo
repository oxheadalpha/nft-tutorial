type ledger = (address, nat) big_map

type storage = {
  ledger : ledger;
  admin : Admin.storage;
  minter_admin : MinterAdmin.storage;
}

type tx = {
  to_: address;
  amount: nat;
}

type entrypoints =
  | Transfer of tx
  | Mint of nat
  | Admin of Admin.entrypoints
  | MinterAdmin of MinterAdmin.entrypoints


[@inline]
let fail_if_not_minter(storage : storage) : unit =
  if Admin.is_admin(storage.admin)
  then unit (* admin can always mint *)
  else if MinterAdmin.is_minter(storage.minter_admin)
  then unit (* minter can mint *)
  else failwith "NOT_A_MINTER"


let mint (ledger, amt : ledger * nat) : ledger =
  let old_bal = match Big_map.find_opt (Tezos.get_sender ()) ledger with
  | None -> 0n
  | Some bal -> bal
  in
  Big_map.update (Tezos.get_sender ()) (Some (old_bal + amt)) ledger

let transfer (storage, tx : storage * tx) : storage =
  let src_bal = match Big_map.find_opt (Tezos.get_sender ()) storage.ledger with
  | None -> 0n
  | Some bal -> bal 
  in
  let l1 = match is_nat (src_bal - tx.amount) with
  |None -> (failwith "NO_FUNDS" : ledger)
  |Some new_bal -> 
      Big_map.update (Tezos.get_sender ()) (Some new_bal) storage.ledger
  in

  let dst_bal = match Big_map.find_opt tx.to_ storage.ledger with
  | None -> tx.amount
  | Some bal -> bal + tx.amount
  in
  let l2 = Big_map.update tx.to_ (Some dst_bal) l1 in
  {storage with ledger = l2; }

let main(p, s : entrypoints * storage) : (operation list) * storage =
  match p with
  | Transfer t ->
    let _ = Admin.fail_if_paused s.admin in
    let new_s = transfer (s, t) in
    ([] : operation list), new_s


  | Mint amt -> 
    let _ = Admin.fail_if_paused s.admin in
    let _ = fail_if_not_minter s in
    let new_ledger = mint (s.ledger, amt) in
    ([] : operation list), {s with ledger = new_ledger; }

  | Admin a ->
    let _ = Admin.fail_if_not_admin s.admin in
    let ops, new_admin = Admin.main (a, s.admin) in
    ops, {s with admin = new_admin; }

  | MinterAdmin a -> 
    let _ = Admin.fail_if_not_admin_ext (s.admin, "ONLY_ADMIN_CAN_CHANGE_MINTER") in
    let ops, new_admin = MinterAdmin.main (a, s.minter_admin) in
    ops, {s with minter_admin = new_admin; }

