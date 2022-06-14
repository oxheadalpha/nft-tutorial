import { tzip12, Tzip12Module } from '@taquito/tzip12';
import { ContractProvider, TezosToolkit, Wallet } from '@taquito/taquito';
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
export interface UseFa2<TProvider extends ContractProvider | Wallet> {
  withFa2: <I extends ContractApi<TProvider> & UseFa2<TProvider>>(
    this: I
  ) => Omit<I & Fa2Contract<TProvider>, keyof UseFa2<TProvider>>;
}

const fa2Api = <
  TProvider extends ContractProvider | Wallet
>(): UseFa2<TProvider> => ({
  withFa2() {
    const r = this.with(Fa2);
    return subtract(r, fa2Api());
  }
});

export interface UseAdmin<TProvider extends ContractProvider | Wallet> {
  withSimpleAdmin: <I extends ContractApi<TProvider>>(
    this: I
  ) => Omit<I & SimpleAdminContract<TProvider>, keyof UseAdmin<TProvider>>;

  withPausableSimpleAdmin: <
    I extends UseAdmin<TProvider> & ContractApi<TProvider>
  >(
    this: I
  ) => Omit<
    I & PausableSimpleAdminContract<TProvider>,
    keyof UseAdmin<TProvider>
  >;

  withMultiAdmin: <I extends UseAdmin<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<I & MultiAdminContract<TProvider>, keyof UseAdmin<TProvider>>;
}

const adminApi = <
  TProvider extends ContractProvider | Wallet
>(): UseAdmin<TProvider> => ({
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

export interface UseMinterAdmin<TProvider extends ContractProvider | Wallet> {
  withMultiMinterAdmin: <
    I extends UseMinterAdmin<TProvider> & ContractApi<TProvider>
  >(
    this: I
  ) => Omit<
    I & MultiMinterAdminContract<TProvider>,
    keyof UseMinterAdmin<TProvider>
  >;
}

const minterAdminApi = <
  TProvider extends ContractProvider | Wallet
>(): UseMinterAdmin<TProvider> => ({
  withMultiMinterAdmin() {
    const r = this.with(MultiMinterAdmin);
    return subtract(r, minterAdminApi());
  }
});

export interface UseNftMint<TProvider extends ContractProvider | Wallet> {
  withMint: <I extends UseNftMint<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<
    I & NftMintableContract<TProvider> & UseFreeze<TProvider>,
    keyof UseNftMint<TProvider>
  >;
}

export interface UseNftBurn<TProvider extends ContractProvider | Wallet> {
  withBurn: <I extends UseNftBurn<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<
    I & NftBurnableContract<TProvider> & UseFreeze<TProvider>,
    keyof UseNftBurn<TProvider>
  >;
}

export interface UseFungibleMint<TProvider extends ContractProvider | Wallet> {
  withMint: <I extends UseFungibleMint<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<
    I & FungibleMintableContract<TProvider> & UseFreeze<TProvider>,
    keyof UseFungibleMint<TProvider>
  >;
}

export interface UseFungibleBurn<TProvider extends ContractProvider | Wallet> {
  withBurn: <I extends UseFungibleBurn<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<
    I & FungibleBurnableContract<TProvider> & UseFreeze<TProvider>,
    keyof UseFungibleBurn<TProvider>
  >;
}

export interface UseMultiFungibleMint<
  TProvider extends ContractProvider | Wallet
> {
  withMint: <
    I extends UseMultiFungibleMint<TProvider> & ContractApi<TProvider>
  >(
    this: I
  ) => Omit<
    I & MultiFungibleMintableContract<TProvider> & UseFreeze<TProvider>,
    keyof UseMultiFungibleMint<TProvider>
  >;
}

export interface UseMultiFungibleBurn<
  TProvider extends ContractProvider | Wallet
> {
  withBurn: <
    I extends UseMultiFungibleBurn<TProvider> & ContractApi<TProvider>
  >(
    this: I
  ) => Omit<
    I & MultiFungibleBurnableContract<TProvider> & UseFreeze<TProvider>,
    keyof UseMultiFungibleBurn<TProvider>
  >;
}

export interface UseFreeze<TProvider extends ContractProvider | Wallet> {
  withFreeze: <I extends UseFreeze<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<I & FreezableContract<TProvider>, keyof UseFreeze<TProvider>>;
}

const freezeApi = <
  TProvider extends ContractProvider | Wallet
>(): UseFreeze<TProvider> => ({
  withFreeze() {
    const r = this.with(Freeze);
    return subtract(r, freezeApi());
  }
});

export interface UseImplementation<
  TProvider extends ContractProvider | Wallet
> {
  asNft: <I extends UseImplementation<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<
    I & UseNftMint<TProvider> & UseNftBurn<TProvider>,
    keyof UseImplementation<TProvider>
  >;

  asFungible: <I extends UseImplementation<TProvider> & ContractApi<TProvider>>(
    this: I
  ) => Omit<
    I & UseFungibleMint<TProvider> & UseFungibleBurn<TProvider>,
    keyof UseImplementation<TProvider>
  >;

  asMultiFungible: <
    I extends UseImplementation<TProvider> & ContractApi<TProvider>
  >(
    this: I
  ) => Omit<
    I & UseMultiFungibleMint<TProvider> & UseMultiFungibleBurn<TProvider>,
    keyof UseImplementation<TProvider>
  >;
}

const nftImplementation = <
  TProvider extends ContractProvider | Wallet
>(): UseNftBurn<TProvider> & UseNftMint<TProvider> => ({
  withBurn() {
    return { ...this.with(BurnNft), ...freezeApi() };
  },
  withMint() {
    return { ...this.with(MintNft), ...freezeApi() };
  }
});

const fungibleImplementation = <
  TProvider extends ContractProvider | Wallet
>(): UseFungibleBurn<TProvider> & UseFungibleMint<TProvider> => ({
  withBurn() {
    return { ...this.with(BurnFungible), ...freezeApi() };
  },
  withMint() {
    return { ...this.with(MintFungible), ...freezeApi() };
  }
});

const multiFungibleImplementation = <
  TProvider extends ContractProvider | Wallet
>(): UseMultiFungibleBurn<TProvider> & UseMultiFungibleMint<TProvider> => ({
  withBurn() {
    return { ...this.with(BurnMultiFungible), ...freezeApi() };
  },
  withMint() {
    return { ...this.with(MintMultiFungible), ...freezeApi() };
  }
});

const implementationApi = <
  TProvider extends ContractProvider | Wallet
>(): UseImplementation<TProvider> => ({
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

const test = async (api: TezosApi<ContractProvider>) => {
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
export interface ContractApi<TProvider extends ContractProvider | Wallet> {
  /**
   * Extend existing contract API
   *
   * @typeParam I current contract API
   * @typeParam O additional API to be composed with the current one
   *
   * @param createApi a constructor function that should return
   * an object (a record of functions) to extend the current API with
   */
  with: <I extends ContractApi<TProvider>, O>(
    this: I,
    createApi: (contract: Tzip12Contract<TProvider>) => O
  ) => I & O;
}

/**
 * Interface to create contract APIs
 **/
export interface TezosApi<TProvider extends ContractProvider | Wallet> {
  /**
   * Create an API to the contract at the specified address
   */
  at: (
    contractAddress: address
  ) => Promise<
    ContractApi<TProvider> &
      UseAdmin<TProvider> &
      UseFa2<TProvider> &
      UseImplementation<TProvider> &
      UseMinterAdmin<TProvider>
  >;

  /**
   * Underlying `TezosToolkit`
   */
  toolkit: TezosToolkit;
}

const contractApi = <TProvider extends ContractProvider | Wallet>(
  contract: Tzip12Contract<TProvider>
): ContractApi<TProvider> => ({
  with(createApi) {
    return { ...this, ...createApi(contract) };
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
 * @returns {@link TezosApi} object to build contract access proxies with specified
 * contract
 */
export const tezosApi = (tzt: TezosToolkit): TezosApi<ContractProvider> => {
  tzt.addExtension(new Tzip12Module());

  return {
    at: async (contractAddress: address) => {
      const contract = await tzt.contract.at(contractAddress, tzip12);
      return {
        ...contractApi(contract),
        ...adminApi(),
        ...minterAdminApi(),
        ...fa2Api(),
        ...implementationApi()
      };
    },

    toolkit: tzt
  };
};

/**
 * Create Tezos API to build modular contract APIs.
 * `tzk` comes from the wallet.
 */
export const tezosWalletApi = (tzt: TezosToolkit): TezosApi<Wallet> => {
  tzt.addExtension(new Tzip12Module());

  return {
    at: async (contractAddress: address) => {
      const contract = await tzt.wallet.at(contractAddress, tzip12);
      return {
        ...contractApi(contract),
        ...adminApi(),
        ...minterAdminApi(),
        ...fa2Api(),
        ...implementationApi()
      };
    },

    toolkit: tzt
  };
};
