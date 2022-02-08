import { MichelsonMap } from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';
import { TokenMetadataInternal } from './interfaces/fa2';
import { nat } from './type-aliases';
import { TokenMetadata } from '@taquito/tzip12';

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
 * is stored on chain in the contract storage
 */
export const createOnChainTokenMetadata = (
  metadata: TokenMetadata
): TokenMetadataInternal => {
  const m: TokenMetadataInternal = {
    token_id: metadata.token_id,
    token_info: new MichelsonMap()
  };
  Object.entries(metadata)
    .filter(([k, v]) => k !== 'token_id')
    .forEach(([k, v]) => {
      const stringValue = JSON.stringify(v, null, 2);
      m.token_info.set(k, char2Bytes(stringValue));
    });
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
  const token_id = typeof tokenId === 'number' ? tokenId : tokenId.toNumber();
  const meta = {
    token_id,
    name,
    decimals: 0,
    isBooleanAmount: true,
    artifactUri
  };
  return createOnChainTokenMetadata(meta);
};
