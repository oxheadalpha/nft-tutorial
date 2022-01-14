// import Conf from 'conf';
import Configstore from 'configstore';
import * as path from 'path';
import * as fs from 'fs';
import * as kleur from 'kleur';
const packageJson = require('../package.json');

const userConfigFile = path.join(process.cwd(), 'tznft');
export const userConfigFileWithExt = userConfigFile + '.json';

export function initUserConfig(): void {
  if (fs.existsSync(userConfigFileWithExt)) {
    console.log(
      kleur.yellow(`${userConfigFileWithExt} config file already exists`)
    );
  } else {
    fs.copyFileSync(
      path.join(__dirname, '../tznft.json'),
      userConfigFileWithExt
    );
    console.log(`${kleur.green(userConfigFileWithExt)} config file created`);
  }
}

export function loadUserConfig(): Configstore {
  if (fs.existsSync(userConfigFileWithExt)) {
    return new Configstore(
      packageJson.name,
      {},
      { configPath: userConfigFileWithExt }
    );
  } else {
    const msg = `Config file ${userConfigFileWithExt} does not exist`;
    console.log(kleur.red(msg));
    suggestCommand('init-config');
    throw new Error(msg);
  }
}

interface ActiveNetworkCfg {
  network: string;
  configKey: string;
}

export function activeNetworkKey(config: Configstore): string {
  const network = config.get('activeNetwork');
  if (typeof network === 'string') {
    return `availableNetworks.${network}`;
  } else {
    const msg = 'no active network selected';
    console.log(kleur.red(msg));
    suggestCommand('set-network');
    throw new Error(msg);
  }
}

export const allAliasesKey = (config: Configstore) =>
  `${activeNetworkKey(config)}.aliases`;

export const aliasKey = (alias: string, config: Configstore) =>
  `${allAliasesKey(config)}.${alias}`;

export const lambdaViewKey = (config: Configstore) =>
  `${activeNetworkKey(config)}.lambdaView`;

export async function loadFile(filePath: string): Promise<string> {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  
  return new Promise<string>((resolve, reject) => {
    if (!fs.existsSync(resolvedPath)) reject(`file ${resolvedPath} does not exist`);
    else
      fs.readFile(resolvedPath, (err, buff) =>
        err ? reject(err) : resolve(buff.toString())
      );
  });
}

export function suggestCommand(cmd: string) {
  console.log(`Try to run ${kleur.green(`tznft ${cmd}`)} command first`);
}
