import * as kleur from 'kleur';
import { TezosToolkit } from '@taquito/taquito';
import { Contract } from '@oxheadalpha/fa2-interfaces';

/**
 * Originate a contract on blockchain
 * @param tz toolkit pointing to a blockchain node RPC. Must be initialized with
 * a signer; Signer will pay origination fees.
 * @param code Michelson code of the contract
 * @param storage initial storage of the contract. Storage can be either Michelson
 * string or TypeScript object
 * @param name name of the contract for logging
 * @returns Taquito contract proxy object
 */
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
      kleur.yellow(
        `originated contract ${name} with address ${kleur.green(
          contract.address
        )}`
      )
    );
    console.log(kleur.yellow(`consumed gas: ${originationOp.consumedGas}`));
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    console.log(kleur.red(`${name} origination error ${jsonError}`));
    return Promise.reject(error);
  }
};
