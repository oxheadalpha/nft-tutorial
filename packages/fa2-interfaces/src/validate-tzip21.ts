import { TezosToolkit } from '@taquito/taquito';
import { validateAddress, ValidationResult } from '@taquito/utils';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from './schemas/tzip21-metadata-schema.json';
import * as v from './meta-validators';

/**
 * Validate token metadata format in accordance with TZIP-21 standard
 * @param meta object representing token metadata.
 * @returns list of validation errors and/or warnings. Each error string starts
 * with `Error:` prefix and each warning string starts with `Warning:` prefix.
 */
export function validateTzip21(meta: object): string[] {
  const ajv = new Ajv();
  addFormats(ajv);
  ajv.validate(schema, meta);
  const schemaErrors = ajv.errors
    ? ajv.errors.map(e => `Error: ${e.instancePath} ${e.message}`)
    : [];

  const heuristics = validateHeuristic(meta);
  const heuristicErrors = [...heuristics].flat();
  return [...schemaErrors, ...heuristicErrors];
}

function* validateHeuristic(meta: any): Generator<string[]> {
  const nonEmptyString = v.validateNonEmptyString(meta);
  const required = v.validateRequired(meta);
  const validateUri = v.validateUri(meta);

  yield required('name');
  yield required('decimals');
  if (meta.decimals !== 0)
    yield ['Error: "decimals" must have value 0 for NFTs'];
  yield required('isBooleanAmount');
  if (meta.isBooleanAmount !== true)
    yield ['Error: "isBooleanAmount" must have value true for NFTs'];
  yield nonEmptyString('name');
  yield v.validateRecommended(meta)('description');
  yield nonEmptyString('description');
  yield nonEmptyString('symbol');

  yield required('artifactUri');
  yield validateUri('artifactUri');
  yield validateUri('thumbnailUri');
  yield validateUri('displayUri');
  yield validateUri('externalUri');

  yield nonEmptyString('rights');
  yield validateTags(meta);
  yield validateAttributes(meta);
  yield validateMinter(meta);
}

function validateTags(meta: any): string[] {
  const tags: string[] | undefined = meta.tags;
  if (tags === undefined || tags.length == 0) return [];

  if (tags.find(t => t === 'awesome') && tags.find(t => t === 'nft'))
    return [
      'Warning: It looks like "tags" property contains sample values "awesome", "nft". Remove or replace them with actual tag values'
    ];

  return [];
}

function validateAttributes(meta: any): string[] {
  const attributes: { name: string; value: string }[] | undefined =
    meta.attributes;
  if (attributes === undefined || attributes.length == 0) return [];

  if (
    attributes.find(
      a => a.name === 'sample attribute' && a.value === 'sample value'
    )
  )
    return [
      'Warning: It looks like "attributes" property contains sample attribute. Remove or replace it with actual attributes'
    ];

  return [];
}

function validateMinter(meta: any): string[] {
  const minter: string | undefined = meta.minter;
  if (minter === undefined) return [];

  const instruction =
    'Specify prope minter tz1 address or remove the attribute';
  if (minter === '')
    return [`Error: "minter" attribute is empty. ${instruction}`];

  if (validateAddress(minter) !== ValidationResult.VALID)
    return [
      `Error: "minter": "${minter}" is not a valid Tezos address. ${instruction}`
    ];

  return [];
}
