import { encrypt, decrypt } from '../../app/ipc/crypto';

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

test('Encrypt should not give same cipherText, even when given different passwords', () => {
    const clearText = 'test message';
    const password = 'test password';
    const password2 = 'another test password';
    expect(encrypt(clearText, password).cipherText).not.toEqual(
        encrypt(clearText, password2).cipherText
    );
});

test('Encrypt should not give same cipherText, even when given the same password', () => {
    const clearText = 'test message';
    const password = 'test password';
    expect(encrypt(clearText, password).cipherText).not.toEqual(
        encrypt(clearText, password).cipherText
    );
});
