import Ajv from 'ajv';
import schema from './schemas/tzip16-metadata-schema.json';
import * as v from './validators';
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
      a => `Error: Author '${a}' in 'authors' has invalid format. Author should be e-mail or URL`
    );
}
