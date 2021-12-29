import * as v from '../src/meta-validators';

describe('test property validators', () => {
  const meta: any = { foo: '', bar: 'b', list: [] };

  const isValid = (result: string[]) => result.length == 0;

  test('missing property', () => {
    const required = v.validateRequired(meta);

    expect(isValid(required('foo'))).toBeTruthy();
    expect(isValid(required('bar'))).toBeTruthy();
    expect(isValid(required('list'))).toBeTruthy();
    expect(isValid(required('buz'))).toBeFalsy();

    const recommended = v.validateRecommended(meta);

    expect(isValid(recommended('foo'))).toBeTruthy();
    expect(isValid(recommended('bar'))).toBeTruthy();
    expect(isValid(recommended('list'))).toBeTruthy();
    expect(isValid(recommended('buz'))).toBeFalsy();
  });

  test('non-empty string property', () => {
    const nonEmpty = v.validateNonEmptyString(meta);

    expect(isValid(nonEmpty('buz'))).toBeTruthy(); //do not validate missing property
    expect(isValid(nonEmpty('bar'))).toBeTruthy();
    expect(isValid(nonEmpty('foo'))).toBeFalsy();
  });

  test('validate URI', () => {
    const meta = {
      emptyUrl: '',
      noProtocol: 'www.google.com',
      http: 'http://foo.com',
      https: 'https://foo.com',
      badProtocol: 'mmm://foo.com',
      badUri: 'blah blah',
      ipfs: 'ipfs://QmRyTc9KbD7ZSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj/23',
      badIpfs: 'ipfs://XXXXXXXSkmEf4e7fk6A44RPciW5pM4iyqRGrhbyvj/23'
    };

    const validate = v.validateUri(meta);
    expect(isValid(validate('emptyUrl'))).toBeFalsy();
    expect(isValid(validate('noProtocol'))).toBeTruthy();
    expect(isValid(validate('http'))).toBeTruthy();
    expect(isValid(validate('https'))).toBeTruthy();
    expect(isValid(validate('badProtocol'))).toBeFalsy();
    expect(isValid(validate('badUri'))).toBeFalsy();
    expect(isValid(validate('ipfs'))).toBeTruthy();
    expect(isValid(validate('badIpfs'))).toBeFalsy();
    expect(isValid(validate('missing'))).toBeTruthy(); //do not validate missing property
  });
});
