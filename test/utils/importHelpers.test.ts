import '../mockWindow';
import { hasNoDuplicate } from '../../app/utils/importHelpers';

test('CheckDuplicates should return true, when sharing some fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [
        { a: 2, b: 1, c: 1 },
        { a: 1, b: 2, c: 1 },
        { a: 2, b: 2, c: 1 },
    ];
    const fields: Array<keyof typeof x> = ['a', 'b', 'c'];

    expect(hasNoDuplicate(x, xs, fields)).toBe(true);
});

test('CheckDuplicates should return false, when sharing all fields in fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [{ a: 1, b: 1, c: 2 }];
    const fields: Array<keyof typeof x> = ['a', 'b'];

    expect(hasNoDuplicate(x, xs, fields)).toBe(false);
});

test('CheckDuplicates should throw an error, if sharing non-common fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [{ a: 2, b: 1, c: 1 }];
    const fields: Array<keyof typeof x> = ['a', 'b'];
    const commonFields: Array<keyof typeof x> = [];

    expect(() => hasNoDuplicate(x, xs, fields, commonFields)).toThrow();
});

test('CheckDuplicates should return true, if only sharing common fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [{ a: 2, b: 1, c: 1 }];
    const fields: Array<keyof typeof x> = ['a', 'b'];
    const commonFields: Array<keyof typeof x> = ['b'];

    expect(hasNoDuplicate(x, xs, fields, commonFields)).toBe(true);
});
