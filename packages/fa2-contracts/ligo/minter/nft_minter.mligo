#if !NFT_MINTER
#define NFT_MINTER

#include "../fa2/fa2_interface.mligo"
#include "../fa2/fa2_errors.mligo"
#include "../token/fa2_nft_token.mligo"

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

type mint_param =
[@layout:comb]
{
  owner : address;
  tokens : token_metadata list;
}

type burn_param =
[@layout:comb]
{
  owner : address;
  tokens : token_id list;
}

type minter_entrypoints =
  | Never of never
#if CAN_FREEZE
  | Mint_freeze
#endif
#if CAN_MINT
  | Mint of mint_param list
#endif
#if CAN_BURN
  | Burn of burn_param list
#endif

type mint_acc = {
  token_metadata : token_metadata_storage;
  ledger : ledger;
}

let mint_tokens(acc, param : mint_acc * mint_param list) : mint_acc =
  let mint = (fun (acc, m : mint_acc * mint_param) ->
    List.fold
      (fun (acc, t : mint_acc * token_metadata) ->
        if Big_map.mem t.token_id acc.token_metadata
        then (failwith "USED_TOKEN_ID" : mint_acc)
        else
          let new_meta = Big_map.add t.token_id t acc.token_metadata in
          let new_ledger = Big_map.add t.token_id m.owner acc.ledger in
          {
            token_metadata = new_meta;
            ledger = new_ledger;
          }
      ) m.tokens acc
  ) in
  List.fold mint param acc

let burn_tokens(ledger, param : ledger * burn_param list) : ledger =
  let burn = (fun (ledger, param : ledger * burn_param) ->
    List.fold (fun (ledger, token_id : ledger * token_id) ->
      match Big_map.find_opt token_id ledger with
      | None -> (failwith fa2_token_undefined : ledger)
      | Some owner ->
        if owner <> param.owner
        then (failwith fa2_not_owner : ledger)
        else Big_map.remove token_id ledger 
    ) param.tokens ledger
  ) in
  List.fold burn param ledger

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
    let mint_in = {
      ledger = _tokens.ledger;
      token_metadata = _tokens.token_metadata;
    } in
    let minted = mint_tokens (mint_in, m) in
    let new_tokens = { _tokens with 
      ledger = minted.ledger;
      token_metadata = minted.token_metadata;
    } in
    new_tokens, _minter
#endif
#if CAN_BURN
  | Burn b ->
    let _ = fail_if_frozen _minter in
    let new_ledger = burn_tokens (_tokens.ledger, b) in
    let new_tokens = { _tokens with ledger = new_ledger; } in
    new_tokens, _minter
#endif

#endif
