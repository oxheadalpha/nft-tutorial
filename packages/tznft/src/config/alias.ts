import { validateAddress, ValidationResult } from '@taquito/utils';
import { InMemorySigner } from '@taquito/signer';
import { Alias } from './parser';

export const isAddress = (address: string) =>
  validateAddress(address) === ValidationResult.VALID;

const checkAddress = (address: string): string => {
  if (isAddress(address)) return address;
  throw new Error(`Invalid address ${address}`);
};

export const aliasFromAddress = (address: string): Alias => ({
  address: checkAddress(address)
});

export const aliasFromSecret = async (secret: string): Promise<Alias> => {
  try {
    const signer = await InMemorySigner.fromSecretKey(secret);
    const address = await signer.publicKeyHash();
    return { address, secret };
  } catch (e) {
    throw new Error(`Invalid secret key: ${secret}`);
  }
};

export const aliasFromAddressOrSecret = async (
  addressOrSecret: string
): Promise<Alias> =>
  isAddress(addressOrSecret)
    ? aliasFromAddress(addressOrSecret)
    : aliasFromSecret(addressOrSecret);
