import Ajv from 'ajv';
import schema from './schemas/tzip21-metadata-schema.json';
import * as v from './validators';

export function validateTzip21(meta: object): string[] {
  return [];
}