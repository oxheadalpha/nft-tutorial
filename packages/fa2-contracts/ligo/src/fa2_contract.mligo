
(** Assemble different modules into a single FA2 contract implementation *)



(* Choose one of the admin modules implementation *)

(* #define USE_SIMPLE_ADMIN *)
(* #define USE_PAUSABLE_SIMPLE_ADMIN *)
(* #define USE_MULTI_ADMIN *)
#define USE_NO_ADMIN

(* Choose one of the minter admin modules implementation *)

#define USE_NULL_MINTER_ADMIN
(* #define USE_ADMIN_AS_MINTER *)
(* #define USE_MULTI_MINTER_ADMIN *)


(* 
Choose minter functionality to plug-in.
You can choose multiple options independently, although "CAN_FREEZE" does not
make sense if at least one of "CAN_MINT", "CAN_BURN" is selected.
*)

#define CAN_MINT
#define CAN_BURN
(* #define CAN_FREEZE *)

(* Choose one of the FA2 core implementations *)

#define USE_NFT_TOKEN
(* #define USE_FUNGIBLE_TOKEN *)
(* #define USE_MULTI_FUNGIBLE_TOKEN *)

(** Contract entry point is "asset_main" function *)
#include "../fa2_lib/fa2_asset.mligo"

