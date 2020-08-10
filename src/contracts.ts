import Conf from 'conf';
import * as kleur from 'kleur';
import * as fs from 'fs';
import * as path from 'path';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { getActiveNetworkCfg, loadUserConfig } from './config-util';
import { resolveAlias2Signer } from './config-aliases';

export interface Fa2TransferDestination {
  to_?: string;
  token_id: BigNumber;
  amount: BigNumber;
}

export interface Fa2Transfer {
  from_?: string;
  txs: Fa2TransferDestination[];
}

export interface BalanceOfRequest {
  owner: string;
  token_id: BigNumber;
}

export interface BalanceOfResponse {
  balance: BigNumber;
  request: BalanceOfRequest;
}

type InspectorStorage = BalanceOfResponse[] | {};

interface TokenMetadata {
  token_id: BigNumber;
  symbol: string;
  name: string;
  decimals: BigNumber;
  extras: MichelsonMap<string, string>;
}

export function createToolkit(
  signer: InMemorySigner,
  config: Conf<Record<string, string>>
): TezosToolkit {
  const { network, configKey } = getActiveNetworkCfg(config);
  const providerUrl = config.get(`${configKey}.providerUrl`);
  if (!providerUrl) {
    const msg = `network provider for ${kleur.yellow(
      network
    )} URL is not configured`;
    console.log(kleur.red(msg));
    throw new Error(msg);
  }

  const toolkit = new TezosToolkit();
  toolkit.setProvider({
    signer,
    rpc: providerUrl,
    config: { confirmationPollingIntervalSecond: 5 }
  });
  return toolkit;
}

export async function originateInspector(tezos: TezosToolkit): Promise<string> {
  const code = await loadFile(path.join(__dirname, '../ligo/out/inspector.tz'));
  const storage = `(Left Unit)`;
  return originateContract(tezos, code, storage, 'inspector');
}

export async function mintNfts(
  owner: string,
  tokens: TokenMetadata[]
): Promise<void> {
  const config = loadUserConfig();
  const signer = await resolveAlias2Signer(owner, config);
  const ownerAddress = await signer.publicKeyHash();
  const tz = createToolkit(signer, config);

  const code = await loadFile(
    path.join(__dirname, '../ligo/out/fa2_fixed_collection_token.tz')
  );
  const storage = createNftStorage(tokens, ownerAddress);

  console.log(kleur.yellow('originating new NFT contract'));
  const nftAddress = await originateContract(tz, code, storage, 'nft');
  console.log(
    kleur.yellow(`originated NFT collection ${kleur.green(nftAddress)}`)
  );
}

export function parseTokens(
  descriptor: string,
  tokens: TokenMetadata[]
): TokenMetadata[] {
  const [id, symbol, name] = descriptor.split(',');
  const token: TokenMetadata = {
    token_id: new BigNumber(id),
    symbol,
    name,
    decimals: new BigNumber(0),
    extras: new MichelsonMap()
  };
  tokens.push(token);
  return tokens;
}

function createNftStorage(tokens: TokenMetadata[], owner: string) {
  const ledger = new MichelsonMap<BigNumber, string>();
  const token_metadata = new MichelsonMap<BigNumber, TokenMetadata>();
  for (let meta of tokens) {
    ledger.set(meta.token_id, owner);
    token_metadata.set(meta.token_id, meta);
  }
  return {
    ledger,
    operators: new MichelsonMap(),
    token_metadata
  };
}

async function loadFile(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) =>
    fs.readFile(filePath, (err, buff) =>
      err ? reject(err) : resolve(buff.toString())
    )
  );
}

async function originateContract(
  tz: TezosToolkit,
  code: string,
  storage: string | object,
  name: string
): Promise<string> {
  const origParam =
    typeof storage === 'string' ? { code, init: storage } : { code, storage };
  try {
    const originationOp = await tz.contract.originate(origParam);

    const contract = await originationOp.contract();
    return contract.address;
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    console.log(kleur.red(`${name} origination error ${jsonError}`));
    return Promise.reject(jsonError);
  }
}