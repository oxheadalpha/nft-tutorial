#if !FUNGIBLE_MINTER
#define FUNGIBLE_MINTER

#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"
#include "../token/fa2_fungible_token.mligo"

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
  amount : nat;
}

type mint_burn_param = mint_burn_tx list

type minter_entrypoints =
  | Never of never
#if CAN_FREEZE
  | Mint_freeze
#endif
#if CAN_MINT
  | Mint of mint_burn_param
#endif
#if CAN_BURN
  | Burn of mint_burn_param
#endif

let get_total_supply_change (txs : mint_burn_tx list) : nat =
  List.fold (fun (total, tx : nat * mint_burn_tx) -> total + tx.amount) txs 0n

let mint_tokens (txs, storage : mint_burn_param * token_storage) : token_storage =
  let new_ledger = List.fold (fun (ledger, tx: ledger * mint_burn_tx) ->
    inc_balance (tx.owner, tx.amount, ledger)
  ) txs storage.ledger in
  let supply_change = get_total_supply_change txs in
  { storage with
    total_supply = storage.total_supply + supply_change;
    ledger = new_ledger;
  }
  
let burn_tokens (txs, storage : mint_burn_param * token_storage) : token_storage =
  let new_ledger = List.fold (fun (ledger, tx: ledger * mint_burn_tx) ->
    dec_balance (tx.owner, tx.amount, ledger)
  ) txs storage.ledger in
  let supply_change = get_total_supply_change txs in
  let new_supply_opt = is_nat (storage.total_supply - supply_change) in
  let new_supply = match new_supply_opt with
  | None -> (failwith fa2_insufficient_balance : nat)
  | Some s -> s
  in
  { storage with
    total_supply = new_supply;
    ledger = new_ledger;
  }

let minter_main (param, _tokens, _minter
  : minter_entrypoints * token_storage * minter_storage)
  : token_storage * minter_storage =
  match param with
  | Never _ -> (failwith "INVALID_INVOCATION" : token_storage * minter_storage)
#if CAN_FREEZE
  | Mint_freeze -> _tokens, true
#endif
#if CAN_MINT
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