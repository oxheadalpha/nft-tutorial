export type Admin =
  | 'USE_SIMPLE_ADMIN'
  | 'USE_PAUSABLE_SIMPLE_ADMIN'
  | 'USE_MULTI_ADMIN'
  | 'USE_NO_ADMIN';

export type MinterAdmin =
  | 'USE_NULL_MINTER_ADMIN'
  | 'USE_ADMIN_AS_MINTER'
  | 'USE_MULTI_MINTER_ADMIN';

export type Implementation =
  | 'USE_NFT_TOKEN'
  | 'USE_FUNGIBLE_TOKEN'
  | 'USE_MULTI_FUNGIBLE_TOKEN';

export type Minter = 'CAN_MINT' | 'CAN_BURN' | 'CAN_FREEZE';

export type ContractParam = {
  implementation: Implementation;
  admin: Admin;
  minterAdmin: MinterAdmin;
  minter: Set<Minter>;
};

export const generateFileContent = (param: ContractParam): string => {
  const content = contractParam2Content(param);
  return assetFileContent(content);
}

type ContractContent = {
  adminDef: string;
  minterAdminDef: string;
  minterDef: string;
  codeImplementation: string;
};

const contractParam2Content = (param: ContractParam): ContractContent => {
  const adminDef = generateAdminDef(param.admin);
  const minterAdminDef = generateMinterAdminDef(param.minterAdmin);
  const minterDef = generateMinterDef(param.minter).join('\n');
  const codeImplementation = generateImplementationDef(param.implementation);
  return { adminDef, minterAdminDef, minterDef, codeImplementation };
};

const generateAdminDef = (admin: Admin): string => `#define ${admin}`;

const generateMinterAdminDef = (minterAdmin: MinterAdmin): string =>
  `#define ${minterAdmin}`;

const generateMinterDef = (minter: Set<Minter>): string[] =>
  [...minter].map(flag => `#define ${flag}`);

const generateImplementationDef = (implementation: Implementation): string =>
  `#define ${implementation}`;

const assetFileContent = (content: ContractContent) => `
(** Assemble different modules into a single FA2 contract implementation *)



(* Choose one of the admin modules implementation *)

${content.adminDef}

(* Choose one of the minter admin modules implementation *)

${content.minterAdminDef}


(* 
Choose minter functionality to plug-in.
You can choose multiple options independently, although "CAN_FREEZE" does not
make sense if at least one of "CAN_MINT", "CAN_BURN" is selected.
*)

${content.minterDef}

(* Choose one of the FA2 core implementations *)

${content.codeImplementation}

(** Contract entry point is "asset_main" function *)
#include "ligo/fa2_asset.mligo"

`;
