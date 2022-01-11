import { ligo } from '@oxheadalpha/tezos-tools';

const main = async () => {
  const ligoEnv = ligo();
  await ligoEnv.printLigoVersion();

  await ligoEnv.compileContract(
    './ligo/src/fa2_nft_asset.mligo',
    'nft_asset_main',
    './dist/fa2_nft_asset.tz'
  );
};

main();
