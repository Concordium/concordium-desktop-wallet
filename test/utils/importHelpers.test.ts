/*
import {
    checkDuplicates
} from '../../app/utils/importHelpers';
*/
// TODO: figure out how to import this function
function checkDuplicates(entry, list, fields, commonFields = undefined) {
    const allEqual = list.find((listElement) =>
        fields
            .map((field) => listElement[field] === entry[field])
            .every(Boolean)
    );

    if (allEqual) {
        return false;
    }

    if (commonFields === undefined) {
        return true;
    }

    const anyEqual = list.find((listElement) =>
        fields
            .filter((field) => !commonFields.includes(field))
            .map((field) => listElement[field] === entry[field])
            .some(Boolean)
    );

    if (anyEqual) {
        throw new Error('disallowed'); // TODO use custom error
    }

    // TODO inform of commonField collision.

    return true;
}

test('CheckDuplicates should return true, when sharing some fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [
        { a: 2, b: 1, c: 1 },
        { a: 1, b: 2, c: 1 },
        { a: 2, b: 2, c: 1 },
    ];
    const fields = ['a', 'b', 'c'];

    expect(checkDuplicates(x, xs, fields)).toBe(true);
});

test('CheckDuplicates should return false, when sharing all fields in fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [{ a: 1, b: 1, c: 2 }];
    const fields = ['a', 'b'];

    expect(checkDuplicates(x, xs, fields)).toBe(false);
});

test('CheckDuplicates should throw an error, if sharing non-common fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [{ a: 2, b: 1, c: 1 }];
    const fields = ['a', 'b'];
    const commonFields = [];

    expect(() => checkDuplicates(x, xs, fields, commonFields)).toThrow(
        'disallowed'
    );
});

test('CheckDuplicates should return true, if only sharing common fields', () => {
    const x = { a: 1, b: 1, c: 1 };
    const xs = [{ a: 2, b: 1, c: 1 }];
    const fields = ['a', 'b'];
    const commonFields = ['b'];

    expect(checkDuplicates(x, xs, fields, commonFields)).toBe(true);
});
