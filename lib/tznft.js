#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const kleur = __importStar(require("kleur"));
const taquito_1 = require("@taquito/taquito");
const config_util_1 = require("./config-util");
const networkConf = __importStar(require("./config-network"));
const aliasConf = __importStar(require("./config-aliases"));
const bootstrap = __importStar(require("./bootstrap"));
const contracts = __importStar(require("./contracts"));
const packageJson = require('../package.json');
// configuration
commander_1.program.version(packageJson.version);
//prettier-ignore
commander_1.program
    .command('init-config')
    .alias('ic')
    .description('create tznft.config file')
    .action(config_util_1.initUserConfig);
// selecting network
//prettier-ignore
commander_1.program
    .command('show-network')
    .alias('shn')
    .description('show currently selected active network', { 'a': 'also shows all available networks' })
    .option('-a --all', 'shows all available configured networks', false)
    .action((options) => __awaiter(void 0, void 0, void 0, function* () { return networkConf.showActiveNetwork(options.all); })).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('set-network')
    .alias('setn')
    .arguments('<network>')
    .description('select network to originate contracts on')
    .action(networkConf.setNetwork);
//prettier-ignore
commander_1.program
    .command('bootstrap')
    .alias('b')
    .description('bootstraps and initialize network provider')
    .action(bootstrap.bootstrap).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('kill-sandbox')
    .alias('k')
    .description('kill running network sandbox. No effect on non-sandbox networks')
    .action(bootstrap.kill);
//aliases
//prettier-ignore
commander_1.program
    .command('show-alias')
    .alias('sha')
    .description('show details about configured address alias')
    .arguments('[alias]')
    .action(aliasConf.showAlias).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('add-alias')
    .alias('adda')
    .description('add new address alias to the configuration')
    .arguments('<alias> <key_or_address>')
    .action(aliasConf.addAlias).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('add-alias-faucet')
    .alias('addaf')
    .description('add new address alias to the configuration from the faucet json file')
    .arguments('<alias> <faucet_file>')
    .action(aliasConf.addAliasFromFaucet).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('remove-alias')
    .alias('rma')
    .description('remove address alias from the configuration')
    .arguments('<alias>')
    .action(aliasConf.removeAlias).passCommandToAction(false);
// nft
//prettier-ignore
commander_1.program
    .command('mint')
    .alias('m')
    .description('create a new NFT contract and mint new tokens')
    .arguments('<owner>')
    .requiredOption('-t, --tokens <tokens...>', 'definitions of new tokens, a list of "id, symbol, name"', contracts.parseTokens, [])
    .action((owner, options) => __awaiter(void 0, void 0, void 0, function* () { return contracts.mintNfts(owner, options.tokens); })).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('show-balance')
    .alias('shb')
    .description('show NFT balances for the specified owner')
    .requiredOption('-s, --signer <signer>', 'address that originates a query')
    .requiredOption('-n, --nft <nft_address>', 'address of the NFT contract')
    .requiredOption('-o, --owner <owner>', 'token owner to check balances')
    .requiredOption('-t, --tokens <tokens...>', 'list of token IDs to check')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    return contracts.showBalances(options.signer, options.nft, options.owner, options.tokens);
})).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('show-meta')
    .alias('shm')
    .description('show metadata for all tokens in the NFT contract')
    .requiredOption('-s, --signer <signer>', 'address that originates a query')
    .requiredOption('-n, --nft <nft_address>', 'address of the NFT contract')
    .requiredOption('-t, --tokens <tokens...>', 'list of token IDs to check')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    return contracts.showMetadata(options.signer, options.nft, options.tokens);
})).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('transfer')
    .alias('tx')
    .description('transfer NFT tokens')
    .requiredOption('-s, --signer <signer>', 'address that originates a transfer')
    .requiredOption('-n, --nft <nft_address>', 'address of the NFT contract')
    .requiredOption('-b, --batch <batch...>', 'definition of individual transfers, a list of "from, to, token_id"', contracts.parseTransfers, [])
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    return contracts.transfer(options.signer, options.nft, options.batch);
})).passCommandToAction(false);
//prettier-ignore
commander_1.program
    .command('update-ops')
    .alias('uo')
    .description('update operators for the token owner')
    .arguments('<owner>')
    .requiredOption('-n, --nft <nft_address>', 'address of the NFT contract')
    .option('-a, --add [add_operators...]', 'list of the "operator, token_id" pairs to be added by the token owner')
    .option('-r, --remove [remove_operators...]', 'list of the "operator, token_id" pairs to be removed by the token owner')
    .action((owner, options) => __awaiter(void 0, void 0, void 0, function* () {
    return contracts.updateOperators(owner, options.nft, options.add || [], options.remove || []);
})).passCommandToAction(false);
//debugging command
//prettier-ignore
commander_1.program
    .command('config-show-all')
    .description('shows whole raw config')
    .action(networkConf.showConfig);
commander_1.program.parseAsync().catch(error => {
    if (typeof error === 'string')
        console.log(kleur.red(error));
    else if (error instanceof taquito_1.TezosOperationError) {
        console.log(kleur.red(`Tezos operation error: ${kleur.bold(error.message)}`));
    }
    else {
        console.log(kleur.red('unknown error:'));
        console.log(error);
    }
});
