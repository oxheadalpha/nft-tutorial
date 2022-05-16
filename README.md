# Tutorial: Non-Fungible Tokens on Tezos Using FA2

## Tutorial

The actual tutorial is located [here](./packages/tznft/README.md).

## Packages

The repo has three following yarn workspaces (packages):

* [tezos-tools](./packages/tezos-tools/) - various utilities to interact with
  [LIGO](https://ligolang.org/) compiler,
  [Flextesa](https://tezos.gitlab.io/flextesa/) sandbox and
  [Pinata](https://www.pinata.cloud/) IPFS from TypeScript code.

* [fa2-interfaces](./packages/fa2-interfaces/) - TypeScript interfaces to
  interact with FA2 contracts on blockchain.

* [fa2-contracts](./packages/fa2-contracts/) - modular [LIGO](https://ligolang.org/)
  implementation of FA2 smart contracts. Contract generator CLI tool `tzgen` and
  [tutorial](./packages/fa2-contracts/README.md).

* [tznft](./packages/tznft/) - NFT minting CLI tool `tznft` and
  [tutorial](./packages/tznft/README.md).

## How to Install And Use CLI Tool

Run the following command to install `tznft` CLI
`npm intsall -g @oxheadalpha/tznft`

You can learn `tznft` command options by running `$ tznft --help` command or
following the [tutorial](./packages/tznft/README.md) steps.

## How to Build The Project

```sh
$ yarn install
$ yarn build
```

If you want to run `tznft` CLI from your local build, run `yarn link` command from
[tznft](./packages/tznft/) package directory.
