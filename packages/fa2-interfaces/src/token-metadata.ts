import { BigNumber } from 'bignumber.js';
import { MichelsonMap } from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';
import { TokenMetadataInternal } from './fa2-interface';
import { nat } from './type-aliases';

/**
 * Create a contract internal token metadata representation where token metadata
 * JSON is stored off chain and referred by the `tokenMetadataUri`
 */
export const createOffChainTokenMetadata = (
  tokenId: nat,
  tokenMetadataUri: string
): TokenMetadataInternal => {
  const m: TokenMetadataInternal = {
    token_id: tokenId,
    token_info: new MichelsonMap()
  };
  m.token_info.set('', char2Bytes(tokenMetadataUri));
  return m;
};

/**
 * Create a contract internal token metadata representation where token metadata
 * JSON is stored on chain in the contract storage
 */
export const createOnChainTokenMetadata = (
  tokenId: nat,
  metadata: object
): TokenMetadataInternal => {
  const m: TokenMetadataInternal = {
    token_id: tokenId,
    token_info: new MichelsonMap()
  };
  Object.entries(metadata).forEach(([k, v]) => {
    const stringValue = JSON.stringify(v, null, 2);
    m.token_info.set(k, char2Bytes(stringValue));
  });
  return m;
};

/**
 * Create a contract internal token metadata representation with on-chain
 * storage of a few essential attributes.
 *
 * @param tokenId token id.
 * @param name display token name.
 * @param decimals the position of the decimal point in token balances for display
 * purposes. The default value is 0. NFT tokens must have decimals value 0.
 * @param isBooleanAmount describes whether an account can have an amount of
 * exactly 0 or 1. The default value is false. Should be true for NFT tokens.
 * @param symbol optional short identifier of the token for display purposes.
 */
export const createSimpleTokenMetadata = (
  tokenId: nat,
  name: string,
  decimals?: nat,
  isBooleanAmount?: boolean,
  symbol?: string
): TokenMetadataInternal => {
  const m: TokenMetadataInternal = {
    token_id: tokenId,
    token_info: new MichelsonMap()
  };

  m.token_info.set('name', char2Bytes(name));

  const dec = new BigNumber(decimals || 0);
  m.token_info.set('decimals', char2Bytes(dec.toString()));

  if (typeof isBooleanAmount !== 'undefined') {
    if (isBooleanAmount && !dec.eq(0))
      throw new Error(
        'Token metadata `isBooleanAmount=true` attribute cannot be used with non-zero `decimals` value.'
      );

    m.token_info.set('isBooleanAmount', char2Bytes(isBooleanAmount.toString()));
  }

  if (symbol) m.token_info.set('symbol', char2Bytes(symbol));

  return m;
};

/**
 * Create a contract internal non-fungible token metadata representation with
 * on-chain storage of a few essential attributes.
 *
 * @param tokenId token id.
 * @param name display token name.
 * @artifactUri optional URI to the digital asset. Used for display purposes
 */
export const createSimpleNftMetadata = (
  tokenId: nat,
  name: string,
  artifactUri?: string
): TokenMetadataInternal => {
  const m = createSimpleTokenMetadata(tokenId, name, 0, true);
  if(artifactUri)
    m.token_info.set('artifactUri', char2Bytes(artifactUri))
  return m;
}
