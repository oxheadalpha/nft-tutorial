import { MichelsonMap } from '@taquito/taquito';
import { address, unit, nat } from '../type-aliases';
import { TokenMetadataInternal } from './fa2';
import { storageBuilder } from './storage-builder';

const common = storageBuilder(
  ({ tokens }: { tokens?: TokenMetadataInternal[] }) => {
    const storage = {
      operators: new MichelsonMap<[address, [address, nat]], unit>(),
      token_metadata: new MichelsonMap<nat, TokenMetadataInternal>()
    };
    if (tokens) tokens.forEach(t => storage.token_metadata.set(t.token_id, t));
    return storage;
  }
);

const addTokensKey = <S>(s: S) => ({ tokens: s });

export const nftStorage = common
  .withF(() => ({
    ledger: new MichelsonMap<nat, address>()
  }))
  .transformResult(addTokensKey);

export type NftStorage = ReturnType<typeof nftStorage.build>;

const fungibleTotalSupply = (p: { totalSupply?: nat }) => ({
  total_supply: p.totalSupply || 0
});

//need to assert that provided token metadata has token_id = 0
export const fungibleTokenStorage = common
  .transformInput(({ token }: { token: TokenMetadataInternal }) => ({
    tokens: [token]
  }))
  .withF(() => ({
    ledger: new MichelsonMap<address, nat>()
  }))
  .withF(fungibleTotalSupply)
  .transformResult(addTokensKey);

export type FungibleTokenStorage = ReturnType<
  typeof fungibleTokenStorage.build
>;

const multiFungibleLedger = () => ({
  ledger: new MichelsonMap<[address, nat], nat>()
});
const addMultiFungibleTotalSupply = (
  s: ReturnType<typeof common.build> & ReturnType<typeof multiFungibleLedger>
) => {
  const total_supply = new MichelsonMap<nat, nat>();
  for (let token_id of s.token_metadata.keys()) total_supply.set(token_id, 0);
  return { ...s, total_supply };
};

export const multiFungibleTokenStorage = common
  .withF(multiFungibleLedger)
  .transformResult(addMultiFungibleTotalSupply)
  .transformResult(addTokensKey);

export type MultiFungibleTokenStorage = ReturnType<
  typeof multiFungibleTokenStorage.build
>;

export const mintFreezeStorage = storageBuilder(() => ({
  mint_freeze: false
}));

export type MintFreeze = ReturnType<typeof mintFreezeStorage.build>;
