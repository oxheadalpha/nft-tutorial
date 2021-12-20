#if !FA2_NFT_ASSET
#define FA2_NFT_ASSET

#include "fa2_nft_token.mligo"
#include "nft_token_manager.mligo"
#include "../admin/simple_admin.mligo"

type asset_storage = {
  assets : nft_token_storage;
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
    let ops, new_assets = nft_token_main (fa2, storage.assets) in
    let new_s = { storage with assets = new_assets; } in
    (ops, new_s)

  | Mint_freeze ->
    let _ = fail_if_not_admin storage.admin in
    ([] : operation list), {storage with mint_freeze = true; }

  | Mint m ->
    let _ = fail_if_not_admin storage.admin in
    let _ = if storage.mint_freeze then failwith "FROZEN" else () in
    let mint_in = {
      ledger = storage.assets.ledger;
      token_metadata = storage.assets.token_metadata;
    } in
    let minted = mint_tokens (mint_in, m) in
    let new_s = { storage with 
      assets.ledger = minted.ledger;
      assets.token_metadata = minted.token_metadata;
    } in
    ([] : operation list), new_s


#endif
