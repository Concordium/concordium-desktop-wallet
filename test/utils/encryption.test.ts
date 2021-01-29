import { encrypt, decrypt } from '../../app/utils/encryption';

test("Decrypt should be encrypt's inverse, if given the same password", () => {
    const clearText = 'test message';
    const password = 'test password';
    expect(decrypt(encrypt(clearText, password), password)).toBe(clearText);
});

test('Decrypt should fail, if given a different password', () => {
    const clearText = 'test message';
    const password = 'test password';
    const wrongPassword = 'another password';
    expect(() => decrypt(encrypt(clearText, password), wrongPassword)).toThrow(
        'bad decrypt'
    );
});
