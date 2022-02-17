#if !FA2_NFT_ASSET
#define FA2_NFT_ASSET

#include "fa2_nft_token.mligo"
#include "nft_token_manager.mligo"
#include "../admin/simple_admin.mligo"

type asset_storage = {
  asset : nft_token_storage;
  admin : admin_storage;
  metadata : contract_metadata;
  (** 
  If this flag is set, no more minting operations permitted.
  Once NFT collection is frozen, no more tokens can be minted.
  *)
  mint_freeze : bool;
}

type asset_entrypoints =
  | Assets of fa2_entry_points
  | Admin of admin_entrypoints
  | Mint of mint_param list
  | Mint_freeze

let nft_asset_main(param, storage : asset_entrypoints * asset_storage)
    : (operation list) * asset_storage =
  match param with
  | Admin a ->
    let ops, admin = admin_main (a, storage.admin) in
    let new_s = { storage with admin = admin; } in
    (ops, new_s)

  | Assets fa2 ->
    let _ = fail_if_paused storage.admin in
    let ops, new_asset = nft_token_main (fa2, storage.asset) in
    let new_s = { storage with asset = new_asset; } in
    (ops, new_s)

  | Mint_freeze ->
    let _ = fail_if_not_admin storage.admin in
    ([] : operation list), {storage with mint_freeze = true; }

  | Mint m ->
    let _ = fail_if_not_admin storage.admin in
    let _ = if storage.mint_freeze then failwith "FROZEN" else () in
    let mint_in = {
      ledger = storage.asset.ledger;
      token_metadata = storage.asset.token_metadata;
    } in
    let minted = mint_tokens (mint_in, m) in
    let new_s = { storage with 
      asset.ledger = minted.ledger;
      asset.token_metadata = minted.token_metadata;
    } in
    ([] : operation list), new_s

let sample_storage : asset_storage = {
  asset = {
    token_metadata = (Big_map.empty : token_metadata_storage);
    ledger = (Big_map.empty : ledger);
    operators = (Big_map.empty : operator_storage);
  };
  admin = {
    admin = ("tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU" : address);
    pending_admin = (None : address option);
    paused = false;
  };
  metadata = Big_map.literal [
    ("", Bytes.pack "tezos-storage:content" );
    ("content", 0x00) (* bytes encoded UTF-8 JSON *)
  ];
  mint_freeze = false ;
}

#endif
