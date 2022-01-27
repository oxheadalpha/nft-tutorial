import { unknown, z } from 'zod';

const toPartial = <T>(o: T): Partial<T> => o;
const partialRecord = <T>(o: z.ZodType<T>) => z.record(o).transform(toPartial)

const alias = z.object({
  address: z.string(),
  secret: z.string().optional()
});

const network = z.object({
  providerUrl: z.string().url(),
  lambdaView: z.string().optional(),
  aliases: partialRecord(alias)
});

const pinataIpfs = z.object({
  apiKey: z.string(),
  secretKey: z.string()
});

export const config = z.object({
  activeNetwork: z.string(),
  availableNetworks: partialRecord(network),
  pinataIpfs: pinataIpfs.optional()
});

export type Alias = z.infer<typeof alias>;
export type Network = z.infer<typeof network>;
export type PinataIpfs = z.infer<typeof pinataIpfs>;
export type Config = z.infer<typeof config>;
