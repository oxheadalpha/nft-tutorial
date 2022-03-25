#if !FUNGIBLE_MINTER
#define FUNGIBLE_MINTER

#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"
#include "../token/fa2_multi_fungible_token.mligo"

#if CAN_FREEZE

type minter_storage = bool

[@inline]
let fail_if_frozen (storage: minter_storage) : unit =
  if storage then failwith "FROZEN" else unit

#else

type minter_storage = unit

[@inline]
let fail_if_frozen (_storage: minter_storage) : unit = unit

#endif

type mint_burn_tx =
[@layout:comb]
{
  owner : address;
  token_id : token_id;
  amount : nat;
}

type mint_burn_param = mint_burn_tx list

type create_token_tx =
[@layout:comb]
{
  token_id : token_id;
  metadata : token_metadata;
}

type create_token_param = create_token_tx list

type minter_entrypoints =
  | Never of never
#if CAN_FREEZE
  | Mint_freeze
#endif
#if CAN_MINT
  | Create_tokens of create_token_param
  | Mint of mint_burn_param
#endif
#if CAN_BURN
  | Burn of mint_burn_param
#endif

let create_token (storage, tx : token_storage * create_token_tx) : token_storage =
  (* extract token id *)
  let existing_meta = Big_map.find_opt tx.token_id storage.token_metadata in
  match existing_meta with
  | Some _ -> (failwith "FA2_DUP_TOKEN_ID" : token_storage)
  | None ->
    let new_meta = Big_map.add tx.token_id tx.metadata storage.token_metadata in
    let new_supply = Big_map.add tx.token_id 0n storage.total_supply in
    { storage with
      token_metadata = new_meta;
      total_supply = new_supply;
    }

let create_tokens (txs, storage : create_token_param * token_storage) : token_storage =
  List.fold create_token txs storage

let  mint_update_balances (txs, ledger : mint_burn_param * ledger) : ledger =
  let mint = fun (l, tx : ledger * mint_burn_tx) ->
    inc_balance (tx.owner, tx.token_id, tx.amount, l) in
  List.fold mint txs ledger

let mint_update_total_supply (txs, total_supplies
    : mint_burn_param * total_supply) : total_supply =
  let update = fun (supplies, tx : total_supply * mint_burn_tx) ->
    let supply_opt = Big_map.find_opt tx.token_id supplies in
    match supply_opt with
    | None -> (failwith fa2_token_undefined : total_supply)
    | Some ts ->
      let new_s = ts + tx.amount in
      Big_map.update tx.token_id (Some new_s) supplies in

  List.fold update txs total_supplies

let mint_tokens (param, storage : mint_burn_param * token_storage) 
    : token_storage =
    let new_ledger = mint_update_balances (param, storage.ledger) in
    let new_supply = mint_update_total_supply (param, storage.total_supply) in
    let new_s = { storage with
      ledger = new_ledger;
      total_supply = new_supply;
    } in
    new_s

let burn_update_balances(txs, ledger : (mint_burn_tx list) * ledger) : ledger =
  let burn = fun (l, tx : ledger * mint_burn_tx) ->
    dec_balance (tx.owner, tx.token_id, tx.amount, l) in
  List.fold burn txs ledger

let burn_update_total_supply (txs, total_supplies
    : mint_burn_param * total_supply) : total_supply =
  let update = fun (supplies, tx : total_supply * mint_burn_tx) ->
    let supply_opt = Big_map.find_opt tx.token_id supplies in
    match supply_opt with
    | None -> (failwith fa2_token_undefined : total_supply)
    | Some ts ->
      let new_s = match is_nat (ts - tx.amount) with
      | None -> (failwith fa2_insufficient_balance : nat)
      | Some s -> s
      in
      Big_map.update tx.token_id (Some new_s) supplies in

  List.fold update txs total_supplies

let burn_tokens (param, storage : mint_burn_param * token_storage) 
    : token_storage =

    let new_ledger = burn_update_balances (param, storage.ledger) in
    let new_supply = burn_update_total_supply (param, storage.total_supply) in
    let new_s = { storage with
      ledger = new_ledger;
      total_supply = new_supply;
    } in
    new_s


let minter_main (param, _tokens, _minter
  : minter_entrypoints * token_storage * minter_storage)
  : token_storage * minter_storage =
  match param with
  | Never _ -> (failwith "INVALID_INVOCATION" : token_storage * minter_storage)
#if CAN_FREEZE
  | Mint_freeze -> _tokens, true
#endif
#if CAN_MINT
  | Create_tokens t ->
    let _ = fail_if_frozen _minter in
    let new_tokens = create_tokens (t, _tokens) in
    new_tokens, _minter

  | Mint m ->
    let _ = fail_if_frozen _minter in
    let new_tokens = mint_tokens (m, _tokens) in
    new_tokens, _minter
#endif
#if CAN_BURN
  | Burn b ->
    let _ = fail_if_frozen _minter in
    let new_tokens = burn_tokens (b, _tokens) in
    new_tokens, _minter
#endif

#endif
