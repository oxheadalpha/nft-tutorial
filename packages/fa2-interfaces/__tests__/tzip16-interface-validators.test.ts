import {validateInterfaces, validateMissingInterfaces} from '../src/validate-tzip16';


describe('test TZIP-16 metadata interfaces validators', () => {

  const isValid = (result: string[]) => result.length == 0;

  test('missing interfaces', () => {
    const ok = { interfaces: ['TZIP-012', 'TZIP-021', 'TZIP-099']};
    const empty_intercases = { interfaces: []};
    const no_interfaces = { };
    const tzip12_missing = { interfaces: ['TZIP-021', 'TZIP-099']};
    const tzip21_missing = { interfaces: ['TZIP-012', 'TZIP-099']};
    const tzip12_21_missing = { interfaces: ['TZIP-099']};

    expect(isValid(validateMissingInterfaces(ok))).toBeTruthy();
    expect(isValid(validateMissingInterfaces(empty_intercases))).toBeFalsy();
    expect(isValid(validateMissingInterfaces(no_interfaces))).toBeFalsy();
    expect(isValid(validateMissingInterfaces(tzip12_missing))).toBeFalsy();
    expect(isValid(validateMissingInterfaces(tzip21_missing))).toBeFalsy();
    expect(isValid(validateMissingInterfaces(tzip12_21_missing))).toBeFalsy();
  })

  test('malformed inrefaces', () => {
    const ok = { interfaces: ['TZIP-012', 'TZIP-021 version 2']};
    const empty_intercases = { interfaces: []};
    const no_interfaces = { };
    const wrong_prefix = {interfaces: ['TZZ-001']}
    const wrong_number1 = {interfaces: ['TZZ-01']}
    const wrong_number2 = {interfaces: ['TZZ-x01']}
    const wrong_number3 = {interfaces: ['TZZ-01x foo']}

    expect(isValid(validateInterfaces(ok))).toBeTruthy();
    expect(isValid(validateInterfaces(empty_intercases))).toBeFalsy();
    expect(isValid(validateInterfaces(no_interfaces))).toBeFalsy();
    expect(isValid(validateInterfaces(wrong_prefix))).toBeFalsy();
    expect(isValid(validateInterfaces(wrong_number1))).toBeFalsy();
    expect(isValid(validateInterfaces(wrong_number2))).toBeFalsy();
    expect(isValid(validateInterfaces(wrong_number3))).toBeFalsy();
    
  })
})