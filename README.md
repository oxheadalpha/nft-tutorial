# Tutorial: Non-Fungible Tokens on Tezos Using FA2

## Tutorial

The actual tutorial is located [here](./packages/tznft/README.md).

## Packages

The repo has three following yarn workspaces (packages):

* [tezos-tools](./packages/tezos-tools/) - various utilities to interact with
  [LIGO](https://ligolang.org/) compiler,
  [Flextesa](https://tezos.gitlab.io/flextesa/) sandbox and
  [Pinata](https://www.pinata.cloud/) IPFS from TypeScript code.

* [fa2-interfaces](./packages/nft-fa2-interfaces/) - TypeScript interfaces to
  interact with FA2 contracts on blockchain.

* [tznft](./packages/tznft/) - CLI `tznft` tool and tutorial.

## How to Install And Use CLI Tool

Run the following command to install `tznft` CLI
`npm intsall -g @oxheadalpha/tznft`

You can learn `tznft` command options by running `$ tznft --help` command or
following the [tutorial](./packages/tznft/README.md) steps.

## How to Buld The Project

```sh
$ yarn install
$ yarn build
```

If you want to run `tznft` CLI from your local build, run `yarn link` command from
[nft-tznft](./packages/tznft/).
