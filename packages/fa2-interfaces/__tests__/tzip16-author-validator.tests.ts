import { validateAuthor } from '../src/validate-tzip16';

describe('test TZIP-16 author validator', () => {
  test('malformed', () => {
    expect(validateAuthor('')).toBeFalsy();
    expect(validateAuthor('John')).toBeFalsy();
    expect(validateAuthor('John john@johndoe.com')).toBeFalsy();
    expect(validateAuthor('  <john@johndoe.com>')).toBeFalsy();
  });

  test('valid', () => {
    expect(validateAuthor('John <john@johndoe.com>')).toBeTruthy();
    expect(validateAuthor('John   <john@johndoe.com>')).toBeTruthy();
    expect(validateAuthor('John Doe <john@johndoe.com>')).toBeTruthy();
    expect(validateAuthor('John Doe <www.johndoe.com>')).toBeTruthy();
  });
});
