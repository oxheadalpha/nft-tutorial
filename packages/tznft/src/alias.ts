import { validateAddress, ValidationResult } from '@taquito/utils';
import { InMemorySigner } from '@taquito/signer';

export interface Alias {
  name: string;
  address: string;
  secret?: string;
}

export const isAddress = (address: string) =>
  validateAddress(address) === ValidationResult.VALID;

const checkAddress = (address: string): string => {
  if (isAddress(address)) return address;
  throw new Error(`Invalid address ${address}`);
};

export const aliasFromAddress = (name: string, address: string): Alias => ({
  name,
  address: checkAddress(address)
});

export const aliasFromSecret = async (
  name: string,
  secret: string
): Promise<Alias> => {
  try {
    const signer = await InMemorySigner.fromSecretKey(secret);
    const address = await signer.publicKeyHash();
    return { name, address, secret };
  } catch (e) {
    throw new Error(`Invalid secret key: ${secret}`);
  }
};

export const aliasFromAddressOrSecret = async (
  name: string,
  addressOrSecret: string
): Promise<Alias> =>
  isAddress(addressOrSecret)
    ? aliasFromAddress(name, addressOrSecret)
    : aliasFromSecret(name, addressOrSecret);

