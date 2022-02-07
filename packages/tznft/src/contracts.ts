import * as kleur from 'kleur';
import * as path from 'path';
import { BigNumber } from 'bignumber.js';
import { TezosToolkit } from '@taquito/taquito';
import { char2Bytes } from '@taquito/utils';
import { InMemorySigner } from '@taquito/signer';
import { TokenMetadata } from '@taquito/tzip12';
import { loadFile } from './config';
import {
  resolveAlias2Signer,
  resolveAlias2Address,
  addAlias
} from './config-aliases';
import * as fa2 from '@oxheadalpha/fa2-interfaces';
import { Fa2 } from '@oxheadalpha/fa2-interfaces';
import { createNftStorage, Nft } from './nft-interface';
import { originateContract } from '@oxheadalpha/tezos-tools';
import { loadConfig, Config, activeNetwork } from './config';

export async function createToolkit(
  address_or_alias: string,
  config: Config
): Promise<TezosToolkit> {
  const signer = await resolveAlias2Signer(address_or_alias, config);
  return createToolkitFromSigner(signer, config);
}

export function createToolkitFromSigner(
  signer: InMemorySigner,
  config: Config
): TezosToolkit {
  const toolkit = createToolkitWithoutSigner(config);
  toolkit.setProvider({
    signer
  });
  return toolkit;
}

export function createToolkitWithoutSigner(config: Config): TezosToolkit {
  const providerUrl = activeNetwork(config).providerUrl;
  const toolkit = new TezosToolkit(providerUrl);
  toolkit.setProvider({
    config: { confirmationPollingIntervalSecond: 5 }
  });
  return toolkit;
}

export async function createCollection(
  owner: string,
  metaFile: string,
  alias?: string
): Promise<void> {
  const config = await loadConfig();
  const tz = await createToolkit(owner, config);
  const ownerAddress = await tz.signer.publicKeyHash();

  const code = await loadFile(path.join(__dirname, './fa2_nft_asset.tz'));
  const metaJson = await loadFile(metaFile);
  const storage = createNftStorage(ownerAddress, metaJson);

  console.log(kleur.yellow('originating new NFT contract...'));
  const contract = await originateContract(tz, code, storage, 'nft');

  if (alias) {
    await addAlias(alias, contract.address);
  }
}

export async function mintNfts(
  owner: string,
  collection: string,
  tokens: fa2.TokenMetadataInternal[]
): Promise<void> {
  if (tokens.length === 0)
    return Promise.reject('there are no token definitions provided');

  const config = await loadConfig();
  const tz = await createToolkit(owner, config);
  const collectionAddress = await resolveAlias2Address(collection, config);
  const ownerAddress = await tz.signer.publicKeyHash();

  const nftContract = (await fa2.tezosApi(tz).at(collectionAddress)).with(Nft);

  console.log(kleur.yellow('minting tokens...'));
  await fa2.runMethod(
    nftContract.mintTokens([{ owner: ownerAddress, tokens }])
  );
  console.log(kleur.green('tokens minted'));
}

export async function mintNftsFromFile(
  owner: string,
  collection: string,
  fileName: string
): Promise<void> {
  const tokens = await loadTokensFromFile(fileName);
  if (tokens.length === 0)
    return Promise.reject('there are no token definitions provided');

  const config = await loadConfig();
  const tz = await createToolkit(owner, config);
  const collectionAddress = await resolveAlias2Address(collection, config);
  const ownerAddress = await tz.signer.publicKeyHash();

  const nftContract = (await fa2.tezosApi(tz).at(collectionAddress)).with(Nft);

  console.log(kleur.yellow('minting tokens...'));
  await fa2.runMethod(
    nftContract.mintTokens([{ owner: ownerAddress, tokens }])
  );
  console.log(kleur.green('tokens minted'));
}

async function loadTokensFromFile(
  fileName: string
): Promise<fa2.TokenMetadataInternal[]> {
  const data = await loadFile(fileName);
  return data
    .split('\n')
    .filter(line => {
      const l = line.trim();
      return l.length > 0 && !l.startsWith('#');
    })
    .map(line => {
      let [tokenId, metadataUri] = line.split(',').map(s => s.trim());

      if (!tokenId || !metadataUri)
        throw new Error(
          `Invalid token file format: ${fileName}. Each line should be 'id, metadataUri'`
        );

      return fa2.createOffChainTokenMetadata(
        new BigNumber(tokenId),
        metadataUri
      );
    });
}

export async function mintFreeze(
  owner: string,
  collection: string
): Promise<void> {
  const config = await loadConfig();
  const tz = await createToolkit(owner, config);
  const collectionAddress = await resolveAlias2Address(collection, config);

  const nftContract = (await fa2.tezosApi(tz).at(collectionAddress)).with(Nft);

  console.log(kleur.yellow('freezing nft collection...'));
  fa2.runMethod(await nftContract.freezeCollection());
  console.log(kleur.green('nft collection frozen'));
}

export function parseTokens(
  descriptor: string,
  tokens: fa2.TokenMetadataInternal[]
): fa2.TokenMetadataInternal[] {
  const [id, tokenMetadataUri] = descriptor.split(',').map(p => p.trim());

  if (!id || !tokenMetadataUri)
    throw new Error(
      `Invalid token format: ${descriptor}. It should be 'id, metadataUri'`
    );

  const token = fa2.createOffChainTokenMetadata(
    new BigNumber(id),
    tokenMetadataUri
  );
  token.token_info.set('', char2Bytes(tokenMetadataUri));
  return [token].concat(tokens);
}

export async function showBalances(
  signer: string,
  contract: string,
  owner: string,
  tokens: string[]
): Promise<void> {
  const config = await loadConfig();

  const tz = await createToolkit(signer, config);
  const ownerAddress = await resolveAlias2Address(owner, config);
  const nftAddress = await resolveAlias2Address(contract, config);
  const lambdaView = activeNetwork(config).lambdaView;
  const requests: fa2.BalanceRequest[] = tokens.map(t => {
    return { token_id: new BigNumber(t), owner: ownerAddress };
  });

  const fa2Contract = (
    await fa2.tezosApi(tz).useLambdaView(lambdaView).at(nftAddress)
  ).with(Fa2);

  console.log(kleur.yellow(`querying NFT contract ${kleur.green(nftAddress)}`));
  const balances = await fa2Contract.queryBalances(requests);

  printBalances(balances);
}

function printBalances(balances: fa2.BalanceResponse[]): void {
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
  contract: string,
  tokens: string[]
): Promise<void> {
  const config = await loadConfig();

  const tz = await createToolkitWithoutSigner(config);
  const nftAddress = await resolveAlias2Address(contract, config);
  const tokenIds = tokens.map(t => Number.parseInt(t));

  const fa2Contract = (await fa2.tezosApi(tz).at(nftAddress)).with(Fa2);

  console.log(kleur.yellow('querying token metadata...'));
  const tokensMeta = await fa2Contract.tokensMetadata(tokenIds);

  tokensMeta.forEach(printTokenMetadata);
}

function printTokenMetadata(m: TokenMetadata) {
  console.log(kleur.green(JSON.stringify(m, null, 2)));
}

export function addTransfer(
  description: string,
  batch: fa2.TransferBatch
): fa2.TransferBatch {
  const [from, to, tokenId] = description.split(',').map(p => p.trim());
  return batch.withTransfer(from, to, new BigNumber(tokenId), 1);
}

export async function transfer(
  signer: string,
  contract: string,
  batch: fa2.TransferBatch
): Promise<void> {
  const config = await loadConfig();
  const txs = await resolveTxAddresses(batch.transfers, config);
  const nftAddress = await resolveAlias2Address(contract, config);
  const tz = await createToolkit(signer, config);

  const fa2Contract = (await fa2.tezosApi(tz).at(nftAddress)).with(Fa2);

  console.log(kleur.yellow('transferring tokens...'));
  await fa2.runMethod(fa2Contract.transferTokens(txs));
  console.log(kleur.green('tokens transferred'));
}

async function resolveTxAddresses(
  transfers: fa2.Transfer[],
  config: Config
): Promise<fa2.Transfer[]> {
  const resolved = transfers.map(async t => {
    return {
      from_: await resolveAlias2Address(t.from_, config),
      txs: await resolveTxDestinationAddresses(t.txs, config)
    };
  });
  return Promise.all(resolved);
}

async function resolveTxDestinationAddresses(
  txs: fa2.TransferDestination[],
  config: Config
): Promise<fa2.TransferDestination[]> {
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
  contract: string,
  addOperators: string[],
  removeOperators: string[]
): Promise<void> {
  const config = await loadConfig();
  const tz = await createToolkit(owner, config);
  const ownerAddress = await tz.signer.publicKeyHash();

  const batch = fa2.operatorUpdateBatch();

  const resolvedAdd = await resolveOperators(
    ownerAddress,
    addOperators,
    config
  );
  batch.addOperators(resolvedAdd);

  const resolvedRemove = await resolveOperators(
    ownerAddress,
    removeOperators,
    config
  );
  batch.removeOperators(resolvedRemove);

  const nftAddress = await resolveAlias2Address(contract, config);

  const fa2Contract = (await fa2.tezosApi(tz).at(nftAddress)).with(Fa2);

  console.log(kleur.yellow('updating operators...'));
  await fa2.runMethod(fa2Contract.updateOperators(batch.updates));
  console.log(kleur.green('updated operators'));
}

async function resolveOperators(
  owner: string,
  operators: string[],
  config: Config
): Promise<fa2.OperatorUpdateParams[]> {
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
