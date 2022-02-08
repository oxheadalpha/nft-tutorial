(**
A generic implemenation of the asset contract.
*)

#if !FA2_ASSET
#define FA2_ASSET

#include "./fa2/fa2_interface.mligo"

(* Definition of the contract admin module *)
#if USE_SIMPLE_ADMIN
#include "./admin/simple_admin.mligo"
#endif

#if USE_PAUSABLE_SIMPLE_ADMIN
#include "./admin/pausable_simple_admin.mligo"
#endif

#if USE_MULTI_ADMIN
#include "./admin/multi_admin.mligo"
#endif

(* Definition of the contract minter admin module *)
#if USE_NULL_MINTER_ADMIN
#include "./minter_admin/null_minter_admin.mligo"
#endif

#if USE_MULI_MINTER_ADMIN
#include "./minter_admin/multi_minter_admin.mligo"
#endif

#if USE_ADMIN_AS_MINTER
#include "./minter_admin/null_minter_admin.mligo"
#endif

(* Core FA2 implementation *)

#if USE_NFT_TOKEN
#include "./token/fa2_nft_token.mligo"
#include "./minter/nft_minter.mligo"
#endif

#if USE_FUNGIBLE_TOKEN
#include "./token/fa2_fungible_token.mligo"
#include "./minter/fungible_minter.mligo"
#endif

#if USE_MULTI_FUNGIBLE_TOKEN
#include "./token/fa2_multi_fungible_token.mligo"
#include "./minter/multi_fungible_minter.mligo"
#endif


type asset_storage = {
  metadata : contract_metadata;
  asset : token_storage;
  admin : admin_storage;
  minter_admin : minter_admin_storage;
  minter : minter_storage;
}

type asset_entrypoints =
  | Assets of fa2_entry_points
  | Admin of admin_entrypoints
  | Minter_admin of minter_admin_entrypoints
  | Minter of minter_entrypoints


#if USE_ADMIN_AS_MINTER

[@inline]
let fail_if_not_minter (storage : asset_storage) : unit =
  let _ = fail_if_not_admin storage.admin in
  unit

#else

[@inline]
let fail_if_not_minter (storage : asset_storage) : unit =
  if is_minter storage.minter_admin then unit else failwith "NOT_MINTER"

#endif

let asset_main (param, storage : asset_entrypoints * asset_storage)
    : (operation list) * asset_storage =
  match param with
  | Assets a ->
    let _ = fail_if_paused storage.admin in
    let ops, new_asset = fa2_main (a, storage.asset) in
    let new_s = { storage with asset = new_asset; } in
    (ops, new_s)

  | Admin a ->
    let ops, new_admin = admin_main (a, storage.admin) in
    let new_s = { storage with admin = new_admin; } in
    (ops, new_s)

  | Minter_admin a -> 
    let _ = fail_if_not_admin storage.admin in
    let ops, new_minter = minter_admin_main (a, storage.minter_admin) in
    let new_s = { storage with minter_admin = new_minter; } in
    (ops, new_s)

  | Minter m ->
    let _ = fail_if_paused storage.admin in
    let _ = fail_if_not_minter storage in
    let new_asset, new_minter = minter_main (m, storage.asset, storage.minter) in
    let new_s = { storage with asset = new_asset; minter = new_minter; } in
    ([] : operation list), new_s

#endif