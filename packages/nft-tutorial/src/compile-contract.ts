import { ligo } from '@oxheadalpha/nft-contracts';

const main = async () => {
  const ligoEnv = ligo();
  await ligoEnv.printLigoVersion();

  await ligoEnv.compileContract(
    './ligo/src/fa2_nft_token.mligo',
    'main',
    './ligo/out/fa2_nft_token.tz'
  );
};

main();
