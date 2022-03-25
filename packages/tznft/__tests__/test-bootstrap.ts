import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { awaitForSandbox } from '@oxheadalpha/tezos-tools';
import { TezosApi, tezosApi } from '@oxheadalpha/fa2-interfaces';

export type TestApi = {
  bob: TezosApi;
  alice: TezosApi;
};

export async function bootstrap(): Promise<TestApi> {
  const api = await flextesaApi('http://localhost:20000');
  await awaitForSandbox(api.bob.toolkit);
  return api;
}

async function flextesaApi(rpc: string): Promise<TestApi> {
  const bob = await createToolkit(
    rpc,
    'edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx'
  );
  const alice = await createToolkit(
    rpc,
    'edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq'
  );
  return { 
    bob: tezosApi(bob), 
    alice: tezosApi(alice) 
  };
}

async function createToolkit(
  rpc: string,
  secretKey: string
): Promise<TezosToolkit> {
  const signer = await InMemorySigner.fromSecretKey(secretKey);
  const toolkit = new TezosToolkit(rpc);
  toolkit.setProvider({ rpc, signer });
  return toolkit;
}
