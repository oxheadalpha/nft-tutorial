import { z } from 'zod';
import { isAddress } from './alias';

const toPartial = <T>(o: T): Partial<T> => o;
const partialRecord = <T>(o: z.ZodType<T>) => z.record(o).transform(toPartial);

const address = () =>
  z.string().refine(
    a => isAddress(a),
    a => ({ message: `Invalid Tezos address: ${a}` })
  );

const alias = z
  .object({
    address: address(),
    secret: z.string().optional()
  })
  .strict();

const network = z
  .object({
    providerUrl: z.string().url(),
    aliases: partialRecord(alias)
  })
  .strict();

const pinataIpfs = z
  .object({
    apiKey: z.string(),
    secretKey: z.string()
  })
  .strict();

const config = z
  .object({
    activeNetwork: z.string(),
    availableNetworks: partialRecord(network),
    pinataIpfs: pinataIpfs.optional()
  })
  .strict()
  .refine(
    c => c.availableNetworks[c.activeNetwork],
    c => ({ message: `Active network ${c.activeNetwork} does not exist in availableNetworks` })
  );

export type Alias = z.infer<typeof alias>;
export type Network = z.infer<typeof network>;
export type PinataIpfs = z.infer<typeof pinataIpfs>;
export type Config = z.infer<typeof config>;

export const parseConfig = (data: unknown): Promise<Config> =>
  config.parseAsync(data);
