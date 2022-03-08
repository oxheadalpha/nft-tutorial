import {
  ContractParam,
  generateFileContent,
  Implementation,
  Minter
} from './contract-generator';

/**
 * Select core FA2 contract implementation
 */
export interface UseImplementation {
  /**
   * Implement FA2 NFT contract
   */
  nft(): UseAdmin;
  /**
   * Implement single fungible token FA2 contract
   */
  fungible(): UseAdmin;
  /**
   * Implement multiple fungible tokens FA2 contract
   */
  multiFungible(): UseAdmin;
}

/**
 * Select contract admin implementation
 */
export interface UseAdmin {
  /**
   * Contract does not have an admin
   */
  withNoAdmin(): UseMinter;

  /**
   * Contract has a single admin
   */
  withSimpleAdmin(): UseMinter;
  /**
   * Contract has a single admin that can pause and unpause the contract
   */
  withPausableSimpleAdmin(): UseMinter;
  /**
   * Contract has multiple admins that can pause and unpause the contract
   */
  withMultiAdmin(): UseMinter;
}

/**
 * Select FA2 contract minting functionality
 */
export interface UseMinter {
  /**
   * Contract cannot mint or burn tokens
   */
  withNoMinter(): Generate;
  /**
   * Contract can mint new tokens
   */
  withMint(): UseMinter & UseMinterAdmin & UseFreeze;
  /**
   * Contract can burn tokens
   */
  withBurn(): UseMinter & UseMinterAdmin & UseFreeze;
}

/**
 * Select if the FA2 contract can freeze mint/burn functionality
 */
export interface UseFreeze {
  /**
   * Mint/burn functionality can be frozen
   */
  withFreeze(): UseMinter & UseMinterAdmin;
}

/**
 * Select minter admin implementation
 */
export interface UseMinterAdmin {
  /**
   * No minter admin. Anyone can mint/burn tokens
   */
  withNoMinterAdmin(): Generate;
  /**
   * Contract admin is also a minter admin
   */
  withAdminAsMinter(): Generate;
  /**
   * Contract has multiple minter admins
   */
  withMultiMinterAdmin(): Generate;
}

export interface Generate {
  /**
   * Generate contract LIGO code
   */
  generate(): string;
}

const WithGenerate = (param: ContractParam): Generate => ({
  generate: () => generateFileContent(param)
});

const WithMinterAdmin = (
  param: Omit<ContractParam, 'minterAdmin'>
): UseMinterAdmin => ({
  withNoMinterAdmin: (): Generate =>
    WithGenerate({
      ...param,
      minterAdmin: 'USE_NULL_MINTER_ADMIN'
    }),
  withAdminAsMinter: (): Generate =>
    WithGenerate({
      ...param,
      minterAdmin: 'USE_ADMIN_AS_MINTER'
    }),
  withMultiMinterAdmin: (): Generate =>
    WithGenerate({
      ...param,
      minterAdmin: 'USE_MULTI_MINTER_ADMIN'
    })
});

const WithFreeze = (param: Omit<ContractParam, 'minterAdmin'>): UseFreeze => ({
  withFreeze: (): UseMinter & UseMinterAdmin => {
    param.minter.add('CAN_FREEZE');
    return { ...WithMinterAdmin(param), ...WithMinter(param) };
  }
});

const WithMinter = (param: Omit<ContractParam, 'minterAdmin'>): UseMinter => ({
  withNoMinter: (): Generate =>
    WithGenerate({
      ...param,
      minter: new Set<Minter>(),
      minterAdmin: 'USE_NULL_MINTER_ADMIN'
    }),
  withMint: (): UseMinter & UseMinterAdmin & UseFreeze => {
    param.minter.add('CAN_MINT');
    return {
      ...WithMinter(param),
      ...WithMinterAdmin(param),
      ...WithFreeze(param)
    };
  },
  withBurn: (): UseMinter & UseMinterAdmin & UseFreeze => {
    param.minter.add('CAN_BURN');
    return {
      ...WithMinter(param),
      ...WithMinterAdmin(param),
      ...WithFreeze(param)
    };
  }
});

const WithAdmin = (implementation: Implementation): UseAdmin => ({
  withNoAdmin: (): UseMinter =>
    WithMinter({
      implementation,
      minter: new Set<Minter>(),
      admin: 'USE_NO_ADMIN'
    }),
  withSimpleAdmin: (): UseMinter =>
    WithMinter({
      implementation,
      minter: new Set<Minter>(),
      admin: 'USE_SIMPLE_ADMIN'
    }),
  withPausableSimpleAdmin: (): UseMinter =>
    WithMinter({
      implementation,
      minter: new Set<Minter>(),
      admin: 'USE_PAUSABLE_SIMPLE_ADMIN'
    }),
  withMultiAdmin: (): UseMinter =>
    WithMinter({
      implementation,
      minter: new Set<Minter>(),
      admin: 'USE_MULTI_ADMIN'
    })
});

/**
 * Create API to configure LIGO contract code generator.
 * 
 * Usage example:
 * 
 * ```typescript
 * const generateContractCode = () =>
 *   Implement.nft()
 *    .withPausableSimpleAdmin()
 *    .withMint()
 *    .withFreeze()
 *    .withAdminAsMinter()
 *    .generate();
 * ```
 */
export const Implement: UseImplementation = {
  nft: () => WithAdmin('USE_NFT_TOKEN'),
  fungible: () => WithAdmin('USE_FUNGIBLE_TOKEN'),
  multiFungible: () => WithAdmin('USE_MULTI_FUNGIBLE_TOKEN')
};

const generateContractCode = () =>
  Implement.nft()
    .withPausableSimpleAdmin()
    .withMint()
    .withFreeze()
    .withAdminAsMinter()
    .generate();
