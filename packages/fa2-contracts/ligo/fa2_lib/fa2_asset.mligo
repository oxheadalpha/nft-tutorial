(**
A generic implemenation of the asset contract.
*)

#if !FA2_ASSET
#define FA2_ASSET

#include "./fa2/fa2_interface.mligo"

(* Definition of the contract admin module *)
#if USE_NO_ADMIN
#include "./admin/no_admin.mligo"
#endif

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

#if USE_MULTI_MINTER_ADMIN
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

module Asset = struct

  type storage = {
    metadata : contract_metadata;
    tokens : Token.storage;
    admin : Admin.storage;
    minter_admin : MinterAdmin.storage;
    minter : Minter.storage;
  }

  type entrypoints =
    | Tokens of fa2_entry_points
    | Admin of Admin.entrypoints
    | Minter_admin of MinterAdmin.entrypoints
    | Minter of Minter.entrypoints


#if USE_ADMIN_AS_MINTER

  [@inline]
  let fail_if_not_minter (storage : storage) : unit =
    let _ = Admin.fail_if_not_admin storage.admin in
    unit

#else

  [@inline]
  let fail_if_not_minter (storage : storage) : unit =
    if MinterAdmin.is_minter storage.minter_admin
    then unit else failwith "NOT_MINTER"

#endif

  let main (param, storage : entrypoints * storage)
      : (operation list) * storage =
    match param with
    | Tokens a ->
      let _ = Admin.fail_if_paused storage.admin in
      let ops, new_tokens = Token.fa2_main (a, storage.tokens) in
      let new_s = { storage with tokens = new_tokens; } in
      (ops, new_s)

    | Admin a ->
      let ops, new_admin = Admin.main (a, storage.admin) in
      let new_s = { storage with admin = new_admin; } in
      (ops, new_s)

    | Minter_admin a -> 
      let _ = Admin.fail_if_not_admin storage.admin in
      let ops, new_minter = MinterAdmin.main (a, storage.minter_admin) in
      let new_s = { storage with minter_admin = new_minter; } in
      (ops, new_s)

    | Minter m ->
      let _ = Admin.fail_if_paused storage.admin in
      let _ = fail_if_not_minter storage in
      let new_tokens, new_minter = Minter.main (m, storage.tokens, storage.minter) in
      let new_s = { storage with tokens = new_tokens; minter = new_minter; } in
      ([] : operation list), new_s

end

#endif
