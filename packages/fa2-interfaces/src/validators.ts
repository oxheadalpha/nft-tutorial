import validUrl from 'valid-url';
import isIPFS from 'is-ipfs';

export const validateRequired =
  (meta: { [key: string]: any }) => (propertyName: string) =>
    meta[propertyName] === undefined
      ? [`Error: Property '${propertyName}' is missing`]
      : [];

export const validateRecommended =
  (meta: { [key: string]: any }) => (propertyName: string) =>
    meta[propertyName] === undefined
      ? [`Warning: Property '${propertyName}' is missing, but recommended`]
      : [];

export const validateNonEmptyString =
  (meta: { [key: string]: string }) => (propertyName: string) => {
    const value = meta[propertyName];
    if (value === undefined) return [];
    if (value.trim() === '')
      return [
        `Warning: Property '${propertyName}' has empty string value. Consider removing or provide a value for the property.`
      ];

    return [];
  };

export const validateUri =
  (meta: { [key: string]: string }) => (propertyName: string) => {
    const value = meta[propertyName];
    if (!value) return [];
    if (isValidUri(value)) return [];
    return [
      `Error: URI format for "${propertyName}": "${value}" seems to be invalid`
    ];
  };

export const isValidUri = (uri: string): boolean => {
  if (validUrl.isWebUri(uri)) return true;
  if (uri.startsWith('ipfs://')) {
    const ipfsPath = '/ipfs/' + uri.substring('ipfs://'.length);
    if (isIPFS.ipfsPath(ipfsPath)) true;
  }
  return false;
};
