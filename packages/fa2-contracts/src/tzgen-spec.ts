import {
  Admin,
  ContractParam,
  Implementation,
  Minter,
  MinterAdmin
} from './contract-generator';

export const createGenSpec = (
  specFile: string,
  kind: string,
  admin: string,
  minter?: string[],
  minterAdmin?: string
) => {
  const params = parseGeneratorParams(kind, admin, minter, minterAdmin);
};

const parseGeneratorParams = (
  kindArg: string,
  adminArg: string,
  minterArg?: string[],
  minterAdminArg?: string
): ContractParam => {
  const implementation = parseImplementation(kindArg);
  const admin = parseAdmin(adminArg);
  const minter = parseMinter(minterArg);
  const minterAdmin = parseMinterAdmin(minterAdminArg);
  validateMinter(minter, minterAdmin);
  return { implementation, admin, minter, minterAdmin };
};

const validateMinter = (
  minter: Set<Minter>,
  minterAdmin: MinterAdmin
): void => {
  if (
    minter.has('CAN_FREEZE') &&
    !minter.has('CAN_MINT') &&
    !minter.has('CAN_BURN')
  )
    throw new Error(`Invalid minter option combination ${[...minter]}.
"CAN_FREEZE" flag cannot be used without either "MINT" or "BURN" flags.`);

  if (minter.size === 0 && minterAdmin != 'USE_NULL_MINTER_ADMIN')
    throw new Error(
      `Invalid minter_admin option. It must be "NO_MINTER" if no minter option is specified.`
    );
};

const parseImplementation = (arg: string): Implementation => {
  switch (arg) {
    case 'NFT':
      return 'USE_NFT_TOKEN';
    case 'FT':
      return 'USE_FUNGIBLE_TOKEN';
    case 'MFT':
      return 'USE_MULTI_FUNGIBLE_TOKEN';
    default:
      throw new Error(`Invalid kind option "${arg}".
Available choices are:
  NFT - non-fungible tokens,
  FT  - single fungible token,
  MFT - multi-fungible-tokens`);
  }
};

const parseAdmin = (arg: string): Admin => {
  switch (arg) {
    case 'NO_ADMIN':
      return 'USE_NO_ADMIN';
    case 'SIMPLE':
      return 'USE_SIMPLE_ADMIN';
    case 'PAUSABLE':
      return 'USE_PAUSABLE_SIMPLE_ADMIN';
    case 'MULTI':
      return 'USE_MULTI_ADMIN';
    default:
      throw new Error(`Invalid admin option "${arg}".
Available choices are:
  NO_ADMIN - contract has no admin,
  SIMPLE - contract has simple admin,
  PAUSABLE - contract has simple admin and can be paused,
  MULTI - contract has multiple admins and can be paused`);
  }
};

const parseMinter = (args?: string[]): Set<Minter> => {
  const flags: Minter[] = (args || []).map(a => {
    switch (a) {
      case 'MINT':
        return 'CAN_MINT';
      case 'BURN':
        return 'CAN_BURN';
      case 'FREEZE':
        return 'CAN_FREEZE';
      default:
        throw new Error(`Invalid minter option "${a}"
Available multiple choices are:
  MINT - contract can mint tokens
  BURN - contract can burn tokens
  FREEZE - mint/burn operations can be frozen`);
    }
  });
  return new Set(flags);
};

const parseMinterAdmin = (arg?: string): MinterAdmin => {
  if (!arg) return 'USE_NULL_MINTER_ADMIN';
  switch (arg) {
    case 'NO_MINTER':
      return 'USE_NULL_MINTER_ADMIN';
    case 'CONTRACT_ADMIN':
      return 'USE_ADMIN_AS_MINTER';
    case 'MULTI':
      return 'USE_MULTI_MINTER_ADMIN';
    default:
      throw new Error(`Invalid minter_admin option "${arg}"
Available choices are:
  NO_ADMIN - contract does not have minter admin role. Everyone can mint/burn tokens
  CONTRACT_ADMIN - minter admin is the same as contract admin
  MULTI - contract can have multiple minter admins`);
  }
};
