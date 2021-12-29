import Ajv from 'ajv';
import schema from './schemas/tzip16-metadata-schema.json';
import * as v from './meta-validators';
import isEmail from 'is-email';

export function validateTzip16(meta: object): string[] {
  const ajv = new Ajv();
  ajv.validate(schema, meta);
  const schemaErrors = ajv.errors
    ? ajv.errors.map(e => `Error: ${e.instancePath} ${e.message}`)
    : [];
  // return ajv.errors?.map(e => JSON.stringify(e));
  const heuristics = validateHeuristic(meta);
  const heuristicErrors = [...heuristics].flat();
  return [...schemaErrors, ...heuristicErrors];
}

function* validateHeuristic(meta: any): Generator<string[]> {
  const nonEmptyString = v.validateNonEmptyString(meta);
  yield v.validateRequired(meta)('name');
  yield nonEmptyString('name');
  yield v.validateRecommended(meta)('description');
  yield nonEmptyString('description');
  yield nonEmptyString('homepage');
  yield v.validateUri(meta)('homepage');
  yield nonEmptyString('version');
  yield [...validateAuthors(meta)].flat();

  const ifaceFmtValidation = validateInterfaces(meta);
  if (ifaceFmtValidation.length > 0) yield ifaceFmtValidation;
  else yield validateMissingInterfaces(meta);
}

const sampleAuthor = 'john.doe@johndoe.com';

function* validateAuthors(meta: any): Generator<string[]> {
  const authors = meta.authors as string[];
  if (!authors) return;
  if (authors.find(a => a === sampleAuthor))
    yield [
      `Warning: It looks like one of authors is a sample '${sampleAuthor}'. Replace with a real author e-mail or URL or remove it`
    ];

  yield authors
    .filter(a => !isEmail(a) && !v.isValidUri(a))
    .map(
      a =>
        `Error: Author "${a}" in "authors" has invalid format. Author should be e-mail or URL`
    );
}

function validateInterfaces(meta: any): string[] {
  if (!meta.interfaces || meta.interfaces.length === 0)
    return ['Warning: consider adding "inrefaces": ["TZIP-012", "TZIP-021"]'];

  return meta.interfaces.flatMap(validateInterface);
}

function validateInterface(iface: string): string[] {
  const invalidFormat = `Error: Invalid interface spec format in "${iface}".`;
  if (!iface.startsWith('TZIP-'))
    return [`${invalidFormat} Required format is TZIP-XXX`];

  const ifaceSpec = iface.substring('TZIP-'.length);
  const [ifaceNumber, extra] = ifaceSpec.split(' ');
  if (ifaceNumber.length !== 3) 
    return [`${invalidFormat} Required format is TZIP-XXX`];
  
  const num = Number.parseInt(ifaceNumber);
  if (Number.isNaN(num))
    return [
      `${invalidFormat} Interface specification must be a 3 digit number as TZIP-XXX [<extra>]`
    ];

  return [];
}

function validateMissingInterfaces(meta: any): string[] {
  const ifaceNums: number[] = meta.interfaces.map(parseInterfaceNumber);
  if (!ifaceNums.find(s => s === 12))
    return ['Warning: consider specifying FA2 interface TZIP-012'];
  if (!ifaceNums.find(s => s === 21))
    return [
      'Warning: consider specifying rich token metadata interface TZIP-021'
    ];

  return [];
}

function parseInterfaceNumber(iface: string): number {
  const prefixLength = 'TZIP-'.length;
  const spec = iface.substring(prefixLength, prefixLength + 3);
  return Number.parseInt(spec);
}
