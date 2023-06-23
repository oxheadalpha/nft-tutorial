(**
Implementation of the FA2 (TZIP-12) interface for NFT assets
*)
#if !FA2_NFT_TOKEN
#define FA2_NFT_TOKEN

#include "token_sig.mligo"
#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"
#include "../fa2/lib/fa2_operator_lib.mligo"

module Token : TokenSig = struct

  (** token_id -> owner_address *)
  type ledger = (nat, address) big_map

  type storage = {
    token_metadata : token_metadata_storage;
    ledger : ledger;
    operators : operator_storage;
  }

  let get_balance (p, ledger : balance_of_param * ledger) : operation =
    let to_balance = fun (r : balance_of_request) ->
      match Big_map.find_opt r.token_id ledger with
      | None -> (failwith fa2_token_undefined : balance_of_response)
      | Some owner ->
        let bal = if owner = r.owner then 1n else 0n in
        { request = r; balance = bal; }
    in
    let responses = List.map to_balance p.requests in
    Tezos.transaction responses 0mutez p.callback

  let transfer (txs, validate_op, ops_storage, ledger
      : (transfer list) * operator_validator * operator_storage * ledger) : ledger =
    (* process individual transfer *)
    let make_transfer = (fun (l, tx : ledger * transfer) ->
      List.fold 
        (fun (ll, dst : ledger * transfer_destination) ->
          if dst.amount = 0n
          then ll
          else if dst.amount <> 1n
          then (failwith fa2_insufficient_balance : ledger)
          else
            let owner = Big_map.find_opt dst.token_id ll in
            match owner with
            | None -> (failwith fa2_token_undefined : ledger)
            | Some o -> 
              if o <> tx.from_
              then (failwith fa2_insufficient_balance : ledger)
              else 
                let _ = validate_op
                  (o, (Tezos.get_sender ()), dst.token_id, ops_storage) in
                Big_map.update dst.token_id (Some dst.to_) ll
        ) tx.txs l
    )
    in 
      
    List.fold make_transfer txs ledger

  let fa2_main (param, storage : fa2_entry_points * storage)
      : (operation  list) * storage =
    match param with
    | Transfer txs -> 
      let new_ledger = transfer 
        (txs, default_operator_validator, storage.operators, storage.ledger) in
      let new_storage = { storage with ledger = new_ledger; } in
      ([] : operation list), new_storage

    | Balance_of p -> 
      let op = get_balance (p, storage.ledger) in
      [op], storage

    | Update_operators updates ->
      let new_ops = fa2_update_operators (updates, storage.operators) in
      let new_storage = { storage with operators = new_ops; } in
      ([] : operation list), new_storage

end

#endif

