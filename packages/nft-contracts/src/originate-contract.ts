import * as kleur from 'kleur';
import { TezosToolkit } from '@taquito/taquito';
import { Contract } from '@oxheadalpha/fa2-interfaces';


export const originateContract = async (
  tz: TezosToolkit,
  code: string,
  storage: string | object,
  name: string
): Promise<Contract> => {
  try {
    const origParam =
      typeof storage === 'string' ? { code, init: storage } : { code, storage };
    const originationOp = await tz.contract.originate(origParam);
    const contract = await originationOp.contract();
    console.log(
      kleur.green(
        `originated contract ${name} with address ${contract.address}`
      )
    );
    console.log(kleur.green(`consumed gas: ${originationOp.consumedGas}`));
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    console.log(kleur.red(`${name} origination error ${jsonError}`));
    return Promise.reject(error);
  }
};