import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from './schemas/tzip21-metadata-schema.json';
import * as v from './validators';

export function validateTzip21(meta: object): string[] {
  const ajv = new Ajv();
  addFormats(ajv);
  ajv.validate(schema, meta);
  const schemaErrors = ajv.errors
    ? ajv.errors.map(e => `Error: ${e.instancePath} ${e.message}`)
    : [];

  return schemaErrors;
}