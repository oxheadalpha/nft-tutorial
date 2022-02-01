import { tzip12, Tzip12Module } from '@taquito/tzip12';

import {
  BatchOperation,
  ContractMethod,
  ContractProvider,
  OperationBatch,
  TezosToolkit,
  TransactionOperation
} from '@taquito/taquito';

import { Tzip12Contract, address, Contract } from './type-aliases';
import {
  SimpleAdminContract,
  NonPausableSimpleAdminContract,
  MultiAdminContract,
  SimpleAdmin,
  NonPausableSimpleAdmin
} from './interfaces/admin';
import { Fa2, Fa2Contract } from './interfaces/fa2';
import {
  BurnFungible,
  BurnMultiFungible,
  BurnNft,
  FreezableContract,
  Freeze,
  FungibleBurnableContract,
  FungibleMintableContract,
  MintFungible,
  MintMultiFungible,
  MintNft,
  MultiFungibleBurnableContract,
  MultiFungibleMintableContract,
  NftBurnableContract,
  NftMintableContract
} from './interfaces/minter';
import { MultiMinterAdmin, MultiMinterAdminContract } from './interfaces/minter-admin';
export interface UseFa2 {
  withFa2: <I extends ContractApi & UseFa2>(
    this: I
  ) => Omit<I & Fa2Contract, keyof UseFa2>;
}

const fa2Api = (): UseFa2 => ({
  withFa2() {
    return this.with(Fa2);
  }
});

export interface UseAdmin {
  withSimpleAdmin: <I extends ContractApi>(
    this: I
  ) => Omit<I & SimpleAdminContract, keyof UseAdmin>;

  withNonPausableSimpleAdmin: <I extends UseAdmin & ContractApi>(
    this: I
  ) => Omit<I & NonPausableSimpleAdminContract, keyof UseAdmin>;

  withMultiAdmin: <I extends UseAdmin & ContractApi>(
    this: I
  ) => Omit<I & MultiAdminContract, keyof UseAdmin>;
}

const adminApi = (): UseAdmin => ({
  withSimpleAdmin() {
    const r = this.with(SimpleAdmin);
    return r;
  },
  withNonPausableSimpleAdmin() {
    const r = this.with(NonPausableSimpleAdmin);
    return r;
  },
  withMultiAdmin() {
    const r = this.with(NonPausableSimpleAdmin);
    return r;
  }
});

export interface UseMinterAdmin {
  withMultiMinterAdmin: <I extends UseMinterAdmin & ContractApi>(
    this: I
  ) => Omit<I & MultiMinterAdminContract, keyof UseMinterAdmin>;
}

const minterAdminApi = (): UseMinterAdmin =>({
  withMultiMinterAdmin() {
    return this.with(MultiMinterAdmin)
  }
})

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
    return this.with(Freeze);
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
    return this.with(nftImplementation);
  },
  asFungible() {
    return this.with(fungibleImplementation);
  },
  asMultiFungible() {
    return this.with(multiFungibleImplementation);
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
  useLambdaView: (lambdaView: address) => TezosApi;

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

    useLambdaView: (lambdaView: address) => tezosApi(tzt, lambdaView),

    toolkit: tzt
  };
};

/**
 * Run and confirms a Taquito ContractMethod
 * @param cm - a Taquito ContractMethod
 * @returns  Taquito TransactionOperation
 *
 * Usage example:
 * ```typescript
 * const op: TransactionOperation = await fa2.runMethod(fa2Contract.transferTokens(txs));
 * ```
 */
export const runMethod = async (
  cm: ContractMethod<ContractProvider>
): Promise<TransactionOperation> => {
  const op = await cm.send();
  await op.confirmation();
  return op;
};

/**
 * Run and confirms a Taquito batch
 * @param batch - a Taquito OperationBatch
 * @returns  Taquito BatchOperation
 *
 * Usage example:
 * ```typescript
 * const batch = toolkit.contract.batch();
 *
 * batch.withContractCall(fa2Contract.transferTokens(txs1));
 * batch.withContractCall(fa2Contract.transferTokens(txs2));
 *
 * const op: BatchOperation = await fa2.runBatch(batch);
 * ```
 */
export const runBatch = async (
  batch: OperationBatch
): Promise<BatchOperation> => {
  const op = await batch.send();
  await op.confirmation();
  return op;
};
