import Configstore from 'configstore';
import * as kleur from 'kleur';
import * as path from 'path';
import * as fs from 'fs';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import {
  loadUserConfig,
  loadFile,
  activeNetworkKey,
  lambdaViewKey
} from './config-util';
import { resolveAlias2Signer, resolveAlias2Address } from './config-aliases';
import * as fa2 from '@oxheadalpha/fa2-interfaces';
import { bytes } from '@oxheadalpha/fa2-interfaces';
import { originateContract } from '@oxheadalpha/nft-contracts';

export async function createToolkit(
  address_or_alias: string,
  config: Configstore
): Promise<TezosToolkit> {
  const signer = await resolveAlias2Signer(address_or_alias, config);
  return createToolkitFromSigner(signer, config);
}

export function createToolkitFromSigner(
  signer: InMemorySigner,
  config: Configstore
): TezosToolkit {
  const pk = `${activeNetworkKey(config)}.providerUrl`;
  const providerUrl = config.get(pk);
  if (!providerUrl) {
    const msg = `network provider for ${kleur.yellow(
      config.get('activeNetwork')
    )} URL is not configured`;
    console.log(kleur.red(msg));
    throw new Error(msg);
  }

  const toolkit = new TezosToolkit(providerUrl);
  toolkit.setProvider({
    signer,
    rpc: providerUrl,
    config: { confirmationPollingIntervalSecond: 5 }
  });
  return toolkit;
}

export async function createCollectionMeta(name: string) {
  const meta = {
    name,
    description: "",
    homepage: "",
    authors: [],
    version: "1.0.0",
    license: {name: "MIT"},
    interfaces: ["TZIP-16", "TZIP-12", "TZIP-21"],
    sources:{
      tools: ["LIGO"],
      location: "https://github.com/oxheadalpha/nft-tutorial"
    }
  };
  const json = JSON.stringify(meta, undefined, 2);
  const fileName = path.join(process.cwd(), name + '.json');
  fs.writeFileSync(fileName, json);
  console.log(kleur.green(`Create collection metadata file ${fileName}`));
}

export async function mintNfts(
  owner: string,
  tokens: fa2.TokenMetadata[]
): Promise<void> {
  if (tokens.length === 0)
    return Promise.reject('there are no token definitions provided');

  const config = loadUserConfig();
  const tz = await createToolkit(owner, config);
  const ownerAddress = await tz.signer.publicKeyHash();

  const code = await loadFile(path.join(__dirname, './fa2_nft_asset.tz'));
  // const storage = createNftStorage(tokens, ownerAddress);
  const storage = createNftStorage2(ownerAddress);

  console.log(kleur.yellow('originating new NFT contract...'));
  const nft = await originateContract(tz, code, storage, 'nft');
  console.log(
    kleur.yellow(`originated NFT collection ${kleur.green(nft.address)}`)
  );
}

export function parseTokens(
  descriptor: string,
  tokens: fa2.TokenMetadata[]
): fa2.TokenMetadata[] {
  const [id, symbol, name, ipfcCid] = descriptor.split(',').map(p => p.trim());
  const token: fa2.TokenMetadata = {
    token_id: new BigNumber(id),
    symbol,
    name,
    decimals: new BigNumber(0),
    extras: new MichelsonMap()
  };
  if (ipfcCid) token.extras.set('ipfs_cid', ipfcCid);
  return [token].concat(tokens);
}

function createNftStorage(tokens: fa2.TokenMetadata[], owner: string) {
  const ledger = new MichelsonMap<BigNumber, string>();
  const token_metadata = new MichelsonMap<BigNumber, fa2.TokenMetadata>();
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

function createNftStorage2(owner: string) {
  const assets = {
    ledger: new MichelsonMap(),
    operators: new MichelsonMap(),
    token_metadata: new MichelsonMap()
  };
  const admin = {
    admin: owner,
    pending_admin: undefined,
    paused: false
  };
  const metadata = new MichelsonMap<string, bytes>();

  return {
    assets,
    admin,
    metadata,
    mint_freeze: false
  };
}

export async function showBalances(
  signer: string,
  nft: string,
  owner: string,
  tokens: string[]
): Promise<void> {
  const config = loadUserConfig();

  const tz = await createToolkit(signer, config);
  const ownerAddress = await resolveAlias2Address(owner, config);
  const nftAddress = await resolveAlias2Address(nft, config);
  const lambdaView = config.get(lambdaViewKey(config));
  const requests: fa2.BalanceOfRequest[] = tokens.map(t => {
    return { token_id: new BigNumber(t), owner: ownerAddress };
  });

  console.log(kleur.yellow(`querying NFT contract ${kleur.green(nftAddress)}`));
  const balances: fa2.BalanceOfResponse[] = await fa2.queryBalances(
    nftAddress,
    tz,
    requests,
    lambdaView
  );

  printBalances(balances);
}

function printBalances(balances: fa2.BalanceOfResponse[]): void {
  console.log(kleur.green('requested NFT balances:'));
  for (let b of balances) {
    console.log(
      kleur.yellow(
        `owner: ${kleur.green(b.request.owner)}\ttoken: ${kleur.green(
          b.request.token_id.toString()
        )}\tbalance: ${kleur.green(b.balance.toString())}`
      )
    );
  }
}

export async function showMetadata(
  signer: string,
  nft: string,
  tokens: string[]
): Promise<void> {
  const config = loadUserConfig();

  const tz = await createToolkit(signer, config);
  const nftAddress = await resolveAlias2Address(nft, config);
  const nftContract = await tz.contract.at(nftAddress);
  const storage = await nftContract.storage<any>();
  const meta: MichelsonMap<BigNumber, fa2.TokenMetadata> =
    storage.token_metadata;

  const tokensMetaP = tokens
    .map(t => new BigNumber(t))
    .map(async tid => {
      return { tid, meta: await meta.get(tid) };
    });
  const tokensMeta = await Promise.all(tokensMetaP);

  tokensMeta.forEach(m => {
    if (m.meta) printTokenMetadata(m.meta);
    else console.log(kleur.red(`token ${m.tid} is missing`));
  });
}

function printTokenMetadata(m: fa2.TokenMetadata) {
  console.log(
    kleur.yellow(
      `token_id: ${kleur.green(m.token_id.toString())}\tsymbol: ${kleur.green(
        m.symbol
      )}\tname: ${kleur.green(m.name)}\textras: ${formatMichelsonMap(m.extras)}`
    )
  );
}

function formatMichelsonMap(m: MichelsonMap<string, string>): string {
  let result = '{ ';
  m.forEach((v, k) => (result += `${kleur.dim().green(k)}=${kleur.green(v)} `));
  result += '}';
  return result;
}

export function parseTransfers(
  description: string,
  batch: fa2.Fa2Transfer[]
): fa2.Fa2Transfer[] {
  const [from_, to_, token_id] = description.split(',').map(p => p.trim());
  const tx: fa2.Fa2Transfer = {
    from_,
    txs: [
      {
        to_,
        token_id: new BigNumber(token_id),
        amount: new BigNumber(1)
      }
    ]
  };
  if (batch.length > 0 && batch[0].from_ === from_) {
    //merge last two transfers if their from_ addresses are the same
    batch[0].txs = batch[0].txs.concat(tx.txs);
    return batch;
  }

  return batch.concat(tx);
}

export async function transfer(
  signer: string,
  nft: string,
  batch: fa2.Fa2Transfer[]
): Promise<void> {
  const config = loadUserConfig();
  const txs = await resolveTxAddresses(batch, config);
  const nftAddress = await resolveAlias2Address(nft, config);
  const tz = await createToolkit(signer, config);
  await fa2.transfer(nftAddress, tz, txs);
}

async function resolveTxAddresses(
  transfers: fa2.Fa2Transfer[],
  config: Configstore
): Promise<fa2.Fa2Transfer[]> {
  const resolved = transfers.map(async t => {
    return {
      from_: await resolveAlias2Address(t.from_, config),
      txs: await resolveTxDestinationAddresses(t.txs, config)
    };
  });
  return Promise.all(resolved);
}

async function resolveTxDestinationAddresses(
  txs: fa2.Fa2TransferDestination[],
  config: Configstore
): Promise<fa2.Fa2TransferDestination[]> {
  const resolved = txs.map(async t => {
    return {
      to_: await resolveAlias2Address(t.to_, config),
      amount: t.amount,
      token_id: t.token_id
    };
  });
  return Promise.all(resolved);
}

export async function updateOperators(
  owner: string,
  nft: string,
  addOperators: string[],
  removeOperators: string[]
): Promise<void> {
  const config = loadUserConfig();
  const tz = await createToolkit(owner, config);
  const ownerAddress = await tz.signer.publicKeyHash();
  const resolvedAdd = await resolveOperators(
    ownerAddress,
    addOperators,
    config
  );
  const resolvedRemove = await resolveOperators(
    ownerAddress,
    removeOperators,
    config
  );
  const nftAddress = await resolveAlias2Address(nft, config);
  await fa2.updateOperators(nftAddress, tz, resolvedAdd, resolvedRemove);
}

async function resolveOperators(
  owner: string,
  operators: string[],
  config: Configstore
): Promise<fa2.OperatorParam[]> {
  const resolved = operators.map(async o => {
    try {
      const [op, token] = o.split(',');
      const operator = await resolveAlias2Address(op, config);
      const token_id = new BigNumber(token);

      return { owner, operator, token_id };
    } catch (e) {
      console.log(
        kleur.red(`cannot parse operator definition ${kleur.yellow(o)}`)
      );
      console.log(
        kleur.red(
          "correct operator format is 'operator_alias_or_address, token_id'"
        )
      );
      throw e;
    }
  });
  return Promise.all(resolved);
}
