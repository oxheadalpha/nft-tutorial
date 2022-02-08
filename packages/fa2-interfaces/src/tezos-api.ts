import { tzip12, Tzip12Module } from '@taquito/tzip12';
import { TezosToolkit } from '@taquito/taquito';

import { Tzip12Contract, address } from './type-aliases';
import {
  SimpleAdminContract,
  PausableSimpleAdminContract,
  MultiAdminContract
} from './interfaces/admin';
import {
  MultiAdmin,
  SimpleAdmin,
  PausableSimpleAdmin
} from './interfaces/admin-combinators';
import { Fa2Contract } from './interfaces/fa2';
import { Fa2 } from './interfaces/fa2-combinator';
import {
  FreezableContract,
  FungibleBurnableContract,
  FungibleMintableContract,
  MultiFungibleBurnableContract,
  MultiFungibleMintableContract,
  NftBurnableContract,
  NftMintableContract
} from './interfaces/minter';
import {
  BurnFungible,
  BurnMultiFungible,
  BurnNft,
  Freeze,
  MintFungible,
  MintMultiFungible,
  MintNft
} from './interfaces/minter-combinators';
import { MultiMinterAdminContract } from './interfaces/minter-admin';
import { MultiMinterAdmin } from './interfaces/minter-admin-combinator';

const subtract = <T1, T2>(a: T1, b: T2): Omit<T1, keyof T2> => {
  const bKeys = new Set(Object.keys(b));
  const newEntries = Object.entries(a).filter(([k, v]) => !bKeys.has(k));
  return Object.fromEntries(newEntries) as Omit<T1, keyof T2>;
};
export interface UseFa2 {
  withFa2: <I extends ContractApi & UseFa2>(
    this: I
  ) => Omit<I & Fa2Contract, keyof UseFa2>;
}

const fa2Api = (): UseFa2 => ({
  withFa2() {
    const r = this.with(Fa2);
    return subtract(r, fa2Api());
  }
});

export interface UseAdmin {
  withSimpleAdmin: <I extends ContractApi>(
    this: I
  ) => Omit<I & SimpleAdminContract, keyof UseAdmin>;

  withPausableSimpleAdmin: <I extends UseAdmin & ContractApi>(
    this: I
  ) => Omit<I & PausableSimpleAdminContract, keyof UseAdmin>;

  withMultiAdmin: <I extends UseAdmin & ContractApi>(
    this: I
  ) => Omit<I & MultiAdminContract, keyof UseAdmin>;
}

const adminApi = (): UseAdmin => ({
  withSimpleAdmin() {
    const r = this.with(SimpleAdmin);
    return subtract(r, adminApi());
  },
  withPausableSimpleAdmin() {
    const r = this.with(PausableSimpleAdmin);
    return subtract(r, adminApi());
  },
  withMultiAdmin() {
    const r = this.with(MultiAdmin);
    return subtract(r, adminApi());
  }
});

export interface UseMinterAdmin {
  withMultiMinterAdmin: <I extends UseMinterAdmin & ContractApi>(
    this: I
  ) => Omit<I & MultiMinterAdminContract, keyof UseMinterAdmin>;
}

const minterAdminApi = (): UseMinterAdmin => ({
  withMultiMinterAdmin() {
    const r = this.with(MultiMinterAdmin);
    return subtract(r, minterAdminApi());
  }
});

export interface UseNftMint {
  withMint: <I extends UseNftMint & ContractApi>(
    this: I
  ) => Omit<I & NftMintableContract & UseFreeze, keyof UseNftMint>;
}

export interface UseNftBurn {
  withBurn: <I extends UseNftBurn & ContractApi>(
    this: I
  ) => Omit<I & NftBurnableContract & UseFreeze, keyof UseNftBurn>;
}

export interface UseFungibleMint {
  withMint: <I extends UseFungibleMint & ContractApi>(
    this: I
  ) => Omit<I & FungibleMintableContract & UseFreeze, keyof UseFungibleMint>;
}

export interface UseFungibleBurn {
  withBurn: <I extends UseFungibleBurn & ContractApi>(
    this: I
  ) => Omit<I & FungibleBurnableContract & UseFreeze, keyof UseFungibleBurn>;
}

export interface UseMultiFungibleMint {
  withMint: <I extends UseMultiFungibleMint & ContractApi>(
    this: I
  ) => Omit<
    I & MultiFungibleMintableContract & UseFreeze,
    keyof UseMultiFungibleMint
  >;
}

export interface UseMultiFungibleBurn {
  withBurn: <I extends UseMultiFungibleBurn & ContractApi>(
    this: I
  ) => Omit<
    I & MultiFungibleBurnableContract & UseFreeze,
    keyof UseMultiFungibleBurn
  >;
}

export interface UseFreeze {
  withFreeze: <I extends UseFreeze & ContractApi>(
    this: I
  ) => Omit<I & FreezableContract, keyof UseFreeze>;
}

const freezeApi = (): UseFreeze => ({
  withFreeze() {
    const r = this.with(Freeze);
    return subtract(r, freezeApi());
  }
});

export interface UseImplementation {
  asNft: <I extends UseImplementation & ContractApi>(
    this: I
  ) => Omit<I & UseNftMint & UseNftBurn, keyof UseImplementation>;

  asFungible: <I extends UseImplementation & ContractApi>(
    this: I
  ) => Omit<I & UseFungibleMint & UseFungibleBurn, keyof UseImplementation>;

  asMultiFungible: <I extends UseImplementation & ContractApi>(
    this: I
  ) => Omit<
    I & UseMultiFungibleMint & UseMultiFungibleBurn,
    keyof UseImplementation
  >;
}

const nftImplementation = (): UseNftBurn & UseNftMint => ({
  withBurn() {
    return { ...this.with(BurnNft), ...freezeApi() };
  },
  withMint() {
    return { ...this.with(MintNft), ...freezeApi() };
  }
});

const fungibleImplementation = (): UseFungibleBurn & UseFungibleMint => ({
  withBurn() {
    return { ...this.with(BurnFungible), ...freezeApi() };
  },
  withMint() {
    return { ...this.with(MintFungible), ...freezeApi() };
  }
});

const multiFungibleImplementation = (): UseMultiFungibleBurn &
  UseMultiFungibleMint => ({
  withBurn() {
    return { ...this.with(BurnMultiFungible), ...freezeApi() };
  },
  withMint() {
    return { ...this.with(MintMultiFungible), ...freezeApi() };
  }
});

const implementationApi = (): UseImplementation => ({
  asNft() {
    const r = this.with(nftImplementation);
    return subtract(r, implementationApi());
  },
  asFungible() {
    const r = this.with(fungibleImplementation);
    return subtract(r, implementationApi());
  },
  asMultiFungible() {
    const r = this.with(multiFungibleImplementation);
    return subtract(r, implementationApi());
  }
});

const test = async (api: TezosApi) => {
  const k = await api.at('KT1');
  const nft = k.asNft();
  const m = nft.withBurn();
  const f = m.withFreeze();
};

/**
 * A type-safe API to a contract at specific address that, by default,
 * has only one method "with". By chaining "with" it can be extended
 * to include multiple interfaces, like FA2, NFT, Admin etc.,
 * like this:
 *
 * ```typescript
 * contract.with(Fa2).with(Nft)
 * ```
 */
export interface ContractApi {
  /**
   * Extend existing contract API
   *
   * @typeParam I current contract API
   * @typeParam O additional API to be composed with the current one
   *
   * @param createApi a constructor function that should return
   * an object (a record of functions) to extend the current API with
   */
  with: <I extends ContractApi, O>(
    this: I,
    createApi: (contract: Tzip12Contract, lambdaView?: address) => O
  ) => I & O;
}

/**
 * Interface to create contract APIs
 */
export interface TezosApi {
  /**
   * Create an API to the contract at the specified address
   */
  at: (
    contractAddress: address
  ) => Promise<ContractApi & UseAdmin & UseFa2 & UseImplementation>;

  /**
   * Specify Taquito lambda view contract address to access contract CPS style
   * view entry points.
   */
  useLambdaView: (lambdaView?: address) => TezosApi;

  /**
   * Underlying `TezosToolkit`
   */
  toolkit: TezosToolkit;
}

const contractApi = (
  contract: Tzip12Contract,
  lambdaView?: address
): ContractApi => ({
  with(createApi) {
    return { ...this, ...createApi(contract, lambdaView) };
  }
});

/**
 * Create Tezos API to build modular contract APIs.
 *
 * Usage example:
 * ```typescript
 * const tzt = new TezosToolkit(...);
 *
 * const nftContract =
 *   (await tezosApi(tz).at(contractAddress))
 *   .with(Nft).with(Fa2);
 * // mintTokens() is defined in Nft extension
 * await nftContract.mintTokens(...);
 * // transfer() is defined in Fa2 extension
 * await nftContract.transfer(...);
 * ```
 * @param tzt Taquito toolkit connecting to a block chain
 * @param lambdaView Taquito lambda view contract address to access contract CPS
 * style view entry points ([see](https://tezostaquito.io/docs/lambda_view/)).
 * You need to deploy lambda view contract and use it address with the sandbox.
 * @returns {@link TezosApi} object to build contract access proxies with specified
 * contract
 */
export const tezosApi = (tzt: TezosToolkit, lambdaView?: address): TezosApi => {
  tzt.addExtension(new Tzip12Module());

  return {
    at: async (contractAddress: address) => {
      const contract = await tzt.contract.at(contractAddress, tzip12);
      return {
        ...contractApi(contract, lambdaView),
        ...adminApi(),
        ...minterAdminApi(),
        ...fa2Api(),
        ...implementationApi()
      };
    },

    useLambdaView: (lambdaView?: address) => tezosApi(tzt, lambdaView),

    toolkit: tzt
  };
};
