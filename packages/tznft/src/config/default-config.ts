import { Config } from './parser';

export const defaultConfig: Config = {
  activeNetwork: 'sandbox',
  availableNetworks: {
    sandbox: {
      providerUrl: 'http://localhost:20000',
      aliases: {
        bob: {
          address: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
          secret: 'edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx'
        },
        alice: {
          address: 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb',
          secret: 'edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq'
        }
      }
    },
    testnet: {
      providerUrl: 'https://rpc.ghostnet.teztnets.xyz',
      aliases: {
        bob: {
          address: 'tz1Miryg4mYhjwdpgvJwhx2qbxg7P5yFnXMZ',
          secret:
            'edskS7aL2vKFKULbDtEUJMf4DEsF9z3UKHx7cHuzmoxy1bpkSwUwnzPANzo2rzH5k47V9rYNSvXxMdLndHYV5FKVTtaVJMAEKz'
        },
        alice: {
          address: 'tz1SaYjmWWmH18iagKoFnbz843X9Zuyshi5e',
          secret:
            'edskS16XUWLW9iqJkFL5YHcTghZQAT6zf3JGrwtpvnZCbwJD9qZaMNDQUcDozHAU6fNQ1PfFKZ3JQZ1MKDH9TXMM6GJr1NXKLU'
        }
      }
    },
    mainnet: {
      providerUrl: 'https://mainnet.smartpy.io',
      aliases: {}
    }
  }
};
