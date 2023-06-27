const adminValues = [
  'USE_SIMPLE_ADMIN',
  'USE_PAUSABLE_SIMPLE_ADMIN',
  'USE_MULTI_ADMIN',
  'USE_NO_ADMIN'
] as const;

export type Admin = typeof adminValues[number];

const minterAdminValues = [
  'USE_NULL_MINTER_ADMIN',
  'USE_ADMIN_AS_MINTER',
  'USE_MULTI_MINTER_ADMIN'
] as const;

export type MinterAdmin = typeof minterAdminValues[number];

const implementationValues = [
  'USE_NFT_TOKEN',
  'USE_FUNGIBLE_TOKEN',
  'USE_MULTI_FUNGIBLE_TOKEN'
] as const;

export type Implementation = typeof implementationValues[number];

const minterValues = ['CAN_MINT', 'CAN_BURN', 'CAN_FREEZE'] as const;

export type Minter = typeof minterValues[number];

export type ContractParam = {
  implementation: Implementation;
  admin: Admin;
  minterAdmin: MinterAdmin;
  minter: Set<Minter>;
};

export const generateFileContent = (param: ContractParam): string => {
  const content = contractParam2Content(param);
  return assetFileContent(content);
};

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

const defFlag = (currentFlag: string, defined: boolean): string => {
  const def = `#define ${currentFlag}`;
  return defined ? def : `(* ${def} *)`;
};

const generateAdminDef = (admin: Admin): string =>
  adminValues.map(a => defFlag(a, a === admin)).join('\n');

const generateMinterAdminDef = (minterAdmin: MinterAdmin): string =>
  minterAdminValues.map(ma => defFlag(ma, ma === minterAdmin)).join('\n');

const generateMinterDef = (minter: Set<Minter>): string[] =>
  minterValues.map(m => defFlag(m, minter.has(m)));

const generateImplementationDef = (implementation: Implementation): string =>
  implementationValues.map(i => defFlag(i, i === implementation)).join('\n');

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

(** Contract entry point is "Asset.main" function *)
#include "../fa2_lib/fa2_asset.mligo"

let asset_main = Asset.main

`;
