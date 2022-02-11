import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { awaitForSandbox } from '@oxheadalpha/tezos-tools';

export async function bootstrap(): Promise<TezosToolkit> {
  const signer = await InMemorySigner.fromSecretKey(
    'edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx'
  );
  const toolkit = new TezosToolkit('http://localhost:20000');
  toolkit.setProvider({signer});
  await awaitForSandbox(toolkit);
  return toolkit;
}
