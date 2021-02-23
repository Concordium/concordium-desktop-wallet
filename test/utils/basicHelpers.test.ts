import { chunks, isHex, partition, toCSV } from '../../app/utils/basicHelpers';

test('Partition should split booleans correctly', () => {
    const list = [true, false, false, true, true, false, false];
    const [trueList, falseList] = partition(list, (x) => x);
    expect(trueList.every(Boolean)).toBe(true);
    expect(falseList.some(Boolean)).toBe(false);
    expect(trueList).toHaveLength(3);
    expect(falseList).toHaveLength(4);
});

test('Partition should split by length correctly', () => {
    const longString = 'aaaaa';
    const longSubList = [1, 1, 1, 1, 1];
    const list = ['a', 'aa', 'aaa', 'aaaa', longString, longSubList];
    const [longList, shortList] = partition(list, (x) => x.length > 4);
    expect(longList).toHaveLength(2);
    expect(shortList).toHaveLength(4);
    expect(longList).toContain(longSubList);
    expect(longList).toContain(longString);
});

test('Partition should handle all true', () => {
    const list = [true, true, true];
    const [trueList, falseList] = partition(list, (x) => x);
    expect(trueList).toHaveLength(3);
    expect(falseList).toHaveLength(0);
});

test('toCSV should put input as csv', () => {
    const elements = [
        ['1', '2'],
        ['1', '3'],
    ];
    const fields = ['first', 'second'];

    const csv = toCSV(elements, fields);
    expect(csv).toEqual('first,second\n1,2\n1,3');
});

test('toCSV should fail on missing fieldNames', () => {
    const elements = [
        ['1', '2'],
        ['1', '3'],
    ];
    const fields = ['first'];

    expect(() => toCSV(elements, fields)).toThrow();
});

test('toCSV should fail on missing fields', () => {
    const elements = [['1', '2'], ['1']];
    const fields = ['first', 'second'];

    expect(() => toCSV(elements, fields)).toThrow();
});

test('toCSV should fail on extra fields', () => {
    const elements = [
        ['1', '2'],
        ['1', '3', '4'],
    ];
    const fields = ['first', 'second'];

    expect(() => toCSV(elements, fields)).toThrow();
});

test('Hex string validates as being hex', () => {
    expect(
        isHex(
            '50ad41624c25e493aa1dc7f4ab32bdc5a3b0b78ecc35b539936e3fea7c565af7'
        )
    ).toBe(true);
});

test('Non-hex string does not validate as being hex', () => {
    expect(isHex('ObviouslyNotAHexString')).toBe(false);
});

test('Empty string does not validate as being hex', () => {
    expect(isHex('')).toBe(false);
});

test('Empty array is chunked into an empty array', () => {
    expect(chunks(new Uint8Array(0), 1)).toStrictEqual([]);
});

test('Zero chunk size fails', () => {
    expect(() => chunks(new Uint8Array(0), 0)).toThrow();
});

test('Negative chunk size fails', () => {
    expect(() => chunks(new Uint8Array(0), -5)).toThrow();
});

test('Array is chunked into chunks of the supplied size', () => {
    expect(chunks(new Uint8Array(8), 2)).toStrictEqual([
        new Uint8Array(2),
        new Uint8Array(2),
        new Uint8Array(2),
        new Uint8Array(2),
    ]);
});

test('Last chunk can be of a size less than the chunk size if array size is not divided equally', () => {
    expect(chunks(new Uint8Array(8), 3)).toStrictEqual([
        new Uint8Array(3),
        new Uint8Array(3),
        new Uint8Array(2),
    ]);
});

test('It is possible to chunk a generic array', () => {
    expect(chunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toStrictEqual([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
    ]);
});

test('Array content is preserved in chunks', () => {
    const array = new Uint8Array(5);
    array[0] = 5;
    array[1] = 1;
    array[2] = 2;
    array[3] = 3;
    array[4] = 4;

    const asChunks = chunks(array, 3);
    expect(asChunks[0][0]).toStrictEqual(5);
    expect(asChunks[0][1]).toStrictEqual(1);
    expect(asChunks[0][2]).toStrictEqual(2);
    expect(asChunks[1][0]).toStrictEqual(3);
    expect(asChunks[1][1]).toStrictEqual(4);
});
