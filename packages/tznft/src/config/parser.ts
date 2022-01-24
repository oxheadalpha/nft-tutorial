import { z } from 'zod';

const alias = z.object({
  address: z.string(),
  secret: z.string().optional()
});

const network = z.object({
  providerUrl: z.string().url(),
  lambdaView: z.string().optional(),
  aliases: z.record(alias)
});

export const configStorage = z.object({
  activeNetwork: z.string(),
  availableNetworks: z.record(network)
});

export type Alias = z.infer<typeof alias>;
export type Network = z.infer<typeof network>;
export type ConfigStorage = z.infer<typeof configStorage>;
export type Config = Network;
