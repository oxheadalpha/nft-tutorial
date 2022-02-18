(**
Implementation of the FA2 interface for the single fungible token contract.
 *)


#if !FA2_FUNGIBLE_TOKEN
#define FA2_FUNGIBLE_TOKEN

#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"
#include "../fa2/lib/fa2_operator_lib.mligo"

(**  owner address -> balance *)
type ledger = (address, nat) big_map

type token_storage = {
  ledger : ledger;
  operators : operator_storage;
  token_metadata : (nat, token_metadata) big_map;
  total_supply : nat;
}

let get_balance_amt (owner, ledger : address  * ledger) : nat =
  let bal_opt = Big_map.find_opt owner ledger in
  match bal_opt with
  | None -> 0n
  | Some b -> b

let inc_balance (owner, amt, ledger
    : address * nat * ledger) : ledger =
  let bal = get_balance_amt (owner, ledger) in
  let updated_bal = bal + amt in
  if updated_bal = 0n
  then Big_map.remove owner ledger
  else Big_map.update owner (Some updated_bal) ledger 

let dec_balance (owner, amt, ledger
    : address * nat * ledger) : ledger =
  let bal = get_balance_amt (owner, ledger) in
  match Michelson.is_nat (bal - amt) with
  | None -> (failwith fa2_insufficient_balance : ledger)
  | Some new_bal ->
    if new_bal = 0n
    then Big_map.remove owner ledger
    else Big_map.update owner (Some new_bal) ledger

(**
Update leger balances according to the specified transfers. Fails if any of the
permissions or constraints are violated.
@param txs transfers to be applied to the ledger
@param validate_op function that validates of the tokens from the particular owner and token id can be transferred. 
 *)
let transfer (txs, validate_op, ops_storage, ledger
    : (transfer list) * operator_validator * operator_storage * ledger)
    : ledger =
  let make_transfer = fun (l, tx : ledger * transfer) ->
    List.fold 
      (fun (ll, dst : ledger * transfer_destination) ->
        if dst.token_id <> 0n
        then (failwith fa2_token_undefined : ledger)
        else
          let _ = validate_op (tx.from_, Tezos.sender, dst.token_id, ops_storage) in
          let lll = dec_balance (tx.from_, dst.amount, ll)
        in 
        inc_balance(dst.to_, dst.amount, lll) 
      ) tx.txs l
  in    
  List.fold make_transfer txs ledger

(** 
Retrieve the balances for the specified tokens and owners
@return callback operation
*)
let get_balance (p, ledger : balance_of_param * ledger) : operation =
  let to_balance = fun (r : balance_of_request) ->
    if r.token_id <> 0n
    then (failwith fa2_token_undefined : balance_of_response)
    else
      let bal = get_balance_amt (r.owner, ledger) in
      let response : balance_of_response = { request = r; balance = bal; } in
      response
  in
  let responses = List.map to_balance p.requests in
  Tezos.transaction responses 0mutez p.callback

(** Validate if all provided token_ids are `0n` and correspond to a single token ID *)
let validate_token_ids (tokens : token_id list) : unit =
  List.iter (fun (id : nat) ->
    if id = 0n then unit else failwith fa2_token_undefined
  ) tokens

let fa2_transfer (txs, storage : (transfer list) * token_storage)
    : token_storage =
  let new_ledger = transfer (txs, default_operator_validator, storage.operators, storage.ledger) in
  let new_storage = { storage with ledger = new_ledger; } in
  new_storage

let fa2_main (param, storage : fa2_entry_points * token_storage)
    : (operation  list) * token_storage =
  match param with
  | Transfer txs -> 
    (* 
    will validate that a sender is either `from_` parameter of each transfer
    or a permitted operator for the owner `from_` address.
    *)
    let new_storage = fa2_transfer (txs, storage) in
    ([] : operation list), new_storage

  | Balance_of p ->
    let op = get_balance (p, storage.ledger) in
    [op], storage

  | Update_operators updates ->
    let new_ops = fa2_update_operators (updates, storage.operators) in
    let new_storage = { storage with operators = new_ops; } in
    ([] : operation list), new_storage

#endif
