import { Alias } from './alias';

export interface Network {
  name: string;
  providerUrl: string;
  inspector: string;
  lambdaView: string;

  aliases(): string;
  aliasByName(name: string): Alias;
  addAlias(alias: Alias): void;
  removeAlias(name: string): void;
}

export interface Config {
  activeNetwork(): Network;
  activeNetworkName(): string;
  setActiveNetwork(name: string): void;

  networks(): Network[];
  networkByName(name: string): void;
}
