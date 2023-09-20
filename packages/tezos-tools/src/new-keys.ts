import { InMemorySigner } from '@taquito/signer';
import { b58cencode, prefix, Prefix } from '@taquito/utils';

import crypto from 'crypto';

/**
 * @param keyType prefix to append to a generated key. The default value is 'edsk2'
 * @returns `{pkh, secret}` where `pkh` if a public key hash (tz address) and
 * `secret` is a secret key.
 */
export const newKeys = async (keyType = Prefix.EDSK2) => {
  const keyBytes = Buffer.alloc(32);
  crypto.randomFillSync(keyBytes);
  const secret = b58cencode(new Uint8Array(keyBytes), prefix[keyType]);
  const pkh = await new InMemorySigner(secret).publicKeyHash();
  return { pkh, secret };
};
