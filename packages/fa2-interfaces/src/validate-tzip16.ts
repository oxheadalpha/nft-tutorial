import Ajv from 'ajv';
import schema from './schemas/tzip16-metadata-schema.json';
import * as v from './validators';

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
  yield v.validateRequired(meta)('name');
  yield v.validateNonEmptyString(meta)('name');
  yield v.validateRecommended(meta)('description');
  yield v.validateNonEmptyString(meta)('description');
  yield v.validateNonEmptyString(meta)('homepage');
  yield v.validateUri(meta)('homepage');
}
