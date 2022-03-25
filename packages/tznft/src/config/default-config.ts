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
      providerUrl: 'https://ithacanet.smartpy.io',
      aliases: {
        bob: {
          address: 'tz1MwszbozUX5nwYLBVkzkroxar2Ac38MfVR',
          secret:
            'edskRmmCnZ5pDJf1wMff6FN3VPsB9XFDQJYC8uVnYSwNYERvYXcmH6FFQH4ZBou2kLe3FPSSYWK5uW6YX8JtxPKqJsvYTFCoQf'
        },
        alice: {
          address: 'tz1TszbzQL5UUy5SH8dNf1cGZrtJ7F7RfFvo',
          secret:
            'edskRhuVzh7pG7VEHKFyn2xDUUGHHuWmjQRVRA8KNentDBKE8Konmb1joaUsiCZFzZdXKNB3cA6F8gQU8WpMcrXrqDj9T5rUCC'
        }
      }
    },
    mainnet: {
      providerUrl: 'https://mainnet.smartpy.io',
      aliases: {}
    }
  }
};
