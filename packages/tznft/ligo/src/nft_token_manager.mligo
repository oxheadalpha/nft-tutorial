#if !NFT_TOKEN_MANAGER
#define NFT_TOKEN_MANAGER

#include "../fa2/fa2_interface.mligo"

type mint_param = {
  owner : address;
  tokens : token_metadata list;
}

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

#endif
