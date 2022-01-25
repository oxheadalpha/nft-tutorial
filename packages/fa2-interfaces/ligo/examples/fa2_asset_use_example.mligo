(** Assemble different modules into a single FA2 contract implementation *)



(* Choose one of the admin modules implementation *)

#define USE_SIMPLE_ADMIN
(* #define USE_NON_PAUSABLE_SIMPLE_ADMIN *)
(* #define USE_MULTI_ADMIN *)
(* #define USE_NO_ADMIN *)
(* #define USE_NULL_ADMIN *)

(* Choose one of the minter admin modules implementation *)

(* #define USE_NULL_MINTER_ADMIN *)
(* #define USE_NOT_MINTER_ADMIN *)
#define USE_MULI_MINTER_ADMIN
(* #define USE_ADMIN_AS_MINTER *)

(* Choose one of the FA2 core implementations *)

(* #define USE_NFT_TOKEN *)
(* #define USE_FUNGIBLE_TOKEN *)
#define USE_MULTI_FUNGIBLE_TOKEN




(** Contract entry point is `asset_main` function *)
#include "../fa2_asset.mligo"

