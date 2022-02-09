import {
  ContractParam,
  generateFileContent,
  Implementation,
  Minter
} from './contract-generator';

export interface UseImplementation {
  nft(): UseAdmin;
  fungible(): UseAdmin;
  multiFungible(): UseAdmin;
}

export interface UseAdmin {
  withNoAdmin(): UseMinter;
  withSimpleAdmin(): UseMinter;
  withPausableSimpleAdmin(): UseMinter;
  withMultiAdmin(): UseMinter;
}

export interface UseMinter {
  withNoMinter(): Generate;
  withMint(): UseMinter & UseMinterAdmin & UseFreeze;
  withBurn(): UseMinter & UseMinterAdmin & UseFreeze;
}

export interface UseFreeze {
  withFreeze(): UseMinter & UseMinterAdmin;
}

export interface UseMinterAdmin {
  withNoMinterAdmin(): Generate;
  withAdminAsMinter(): Generate;
  withMultiMinterAdmin(): Generate;
}

export interface Generate {
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

export const Implement: UseImplementation = {
  nft: () => WithAdmin('USE_NFT_TOKEN'),
  fungible: () => WithAdmin('USE_FUNGIBLE_TOKEN'),
  multiFungible: () => WithAdmin('USE_MULTI_FUNGIBLE_TOKEN')
};

const test = () =>
  Implement.nft()
    .withPausableSimpleAdmin()
    .withMint()
    .withFreeze()
    .withAdminAsMinter()
    .generate();
