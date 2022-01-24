import Ajv from 'ajv';
import schema from './schemas/tzip16-metadata-schema.json';
import * as v from './meta-validators';
import isEmail from 'is-email';

/**
 * Validate contract metadata format in accordance with TZIP-16 standard
 * @param meta object representing contract metadata.
 * @returns list of validation errors and/or warnings. Each error string starts
 * with `Error:` prefix and each warning string starts with `Warning:` prefix.
 */
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
  yield validateDescription(meta);
  yield nonEmptyString('homepage');
  yield validateHomepage(meta);
  yield v.validateUri(meta)('homepage');
  yield nonEmptyString('version');
  yield [...validateAuthors(meta)].flat();

  const ifaceFmtValidation = validateInterfaces(meta);
  if (ifaceFmtValidation.length > 0) yield ifaceFmtValidation;
  else yield validateMissingInterfaces(meta);
}

function validateDescription(meta: any): string[] {
  if (meta.description && meta.description === 'Awesome NFT collection')
    return [
      'Warning: It looks like "description" has a sample value. Replace with a real description or remove it'
    ];
  return [];
}

function validateHomepage(meta: any): string[] {
  if (
    meta.homepage &&
    meta.homepage === 'https://github.com/oxheadalpha/nft-tutorial'
  )
    return [
      'Warning: It looks like "homepage" has a sample value. Replace with a real URL or remove it'
    ];
  return [];
}

const sampleAuthor = 'John Doe <john.doe@johndoe.com>';

function* validateAuthors(meta: any): Generator<string[]> {
  const authors = meta.authors as string[];
  if (!authors) return;
  if (authors.find(a => a === sampleAuthor))
    yield [
      `Warning: It looks like one of the authors is a sample '${sampleAuthor}'. Replace with a real author e-mail or URL or remove it`
    ];

  yield authors
    .filter(a => !validateAuthor(a))
    .map(
      a =>
        `Error: Author "${a}" in "authors" has invalid format. Author should be in form "Print Name <e-mail_or_url>"`
    );
}

export function validateAuthor(author: string): boolean {
  const parts = author
    .split(' ')
    .map(p => p.trim())
    .filter(p => p !== '');
  if (parts.length < 2) return false;
  const quoted_email_or_url = parts.at(-1);
  if (
    !quoted_email_or_url?.startsWith('<') &&
    !quoted_email_or_url?.endsWith('>')
  )
    return false;

  const email_or_url = quoted_email_or_url.substring(
    1,
    quoted_email_or_url.length - 1
  );

  return isEmail(email_or_url) || v.isValidUri(email_or_url);
}

export function validateInterfaces(meta: any): string[] {
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

export function validateMissingInterfaces(meta: any): string[] {
  const ifaceNums: number[] = meta.interfaces
    ? meta.interfaces.map(parseInterfaceNumber)
    : [];
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
