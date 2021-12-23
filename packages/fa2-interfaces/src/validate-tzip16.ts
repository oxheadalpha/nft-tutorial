import Ajv from 'ajv';
import schema from './schemas/tzip16-metadata-schema.json';

export function validateTzip16(
  metadata: object
): string[] | undefined  {
  const ajv = new Ajv();
  ajv.validate(schema, metadata);
  return ajv.errors?.map(e => `Error: ${e.instancePath} ${e.message}`);
  // return ajv.errors?.map(e => JSON.stringify(e));
}
