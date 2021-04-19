import {
    chunkArray,
    chunkBuffer,
    isHex,
    onlyDigitsNoLeadingZeroes,
    partition,
    toCSV,
    collapseFraction,
} from '../../app/utils/basicHelpers';

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

test('A string containing only digits validates as being digits', () => {
    expect(onlyDigitsNoLeadingZeroes('63161367813539032')).toBe(true);
});

test('A string containing only digits, but with a leading zero, does not validate', () => {
    expect(onlyDigitsNoLeadingZeroes('063161367813539032')).toBe(false);
});

test('A string containing a non-digit character does not validate', () => {
    expect(onlyDigitsNoLeadingZeroes('063161367f813539032')).toBe(false);
});

test('An empty string does not validate', () => {
    expect(onlyDigitsNoLeadingZeroes('')).toBe(false);
});

test('Empty array is chunked into an empty array', () => {
    expect(chunkBuffer(Buffer.from('', 'hex'), 1)).toStrictEqual([]);
});

test('Zero chunk size fails', () => {
    expect(() => chunkBuffer(Buffer.from('', 'hex'), 0)).toThrow();
});

test('Negative chunk size fails', () => {
    expect(() => chunkBuffer(Buffer.from('', 'hex'), -5)).toThrow();
});

test('Buffer is chunked into chunks of the supplied size', () => {
    expect(
        chunkBuffer(Buffer.from('0000000000000000', 'hex'), 2)
    ).toStrictEqual([
        Buffer.from('0000', 'hex'),
        Buffer.from('0000', 'hex'),
        Buffer.from('0000', 'hex'),
        Buffer.from('0000', 'hex'),
    ]);
});

test('Last chunk can be of a size less than the chunk size if array size is not divided equally', () => {
    expect(
        chunkBuffer(Buffer.from('0000000000000000', 'hex'), 3)
    ).toStrictEqual([
        Buffer.from('000000', 'hex'),
        Buffer.from('000000', 'hex'),
        Buffer.from('0000', 'hex'),
    ]);
});

test('Buffer content is preserved in chunks', () => {
    const array = Buffer.alloc(5);
    array.writeUInt8(5, 0);
    array.writeUInt8(1, 1);
    array.writeUInt8(2, 2);
    array.writeUInt8(3, 3);
    array.writeUInt8(4, 4);

    const asChunks = chunkBuffer(array, 3);
    expect(asChunks[0][0]).toStrictEqual(5);
    expect(asChunks[0][1]).toStrictEqual(1);
    expect(asChunks[0][2]).toStrictEqual(2);
    expect(asChunks[1][0]).toStrictEqual(3);
    expect(asChunks[1][1]).toStrictEqual(4);
});

test('It is possible to chunk a generic array', () => {
    expect(chunkArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toStrictEqual([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
    ]);
});

test('It is possible to chunk a buffer array', () => {
    const buffers = [Buffer.of(1), Buffer.of(2), Buffer.of(3)];
    const chunkedBuffers = chunkArray(buffers, 2);
    expect(Buffer.concat(chunkedBuffers[0])).toHaveLength(2);
    expect(Buffer.concat(chunkedBuffers[1])).toHaveLength(1);
});

test('collapseFraction should return numerator, if denominator is 1.', () => {
    const fraction = { numerator: 13n, denominator: 1n };
    expect(collapseFraction(fraction) === 13n).toBeTruthy();
});

test('if the denominator divides the numerator, collapseFraction should return the quotient. ', () => {
    const fraction = { numerator: 500n, denominator: 25n };
    expect(collapseFraction(fraction) === 20n).toBeTruthy();
});

test('Extra tests for collapseFraction with integer quotients', () => {
    expect(
        collapseFraction({ numerator: 39n, denominator: 13n }) === 3n
    ).toBeTruthy();
    expect(
        collapseFraction({ numerator: 100n, denominator: 1n }) === 100n
    ).toBeTruthy();
    expect(
        collapseFraction({ numerator: 514n, denominator: 257n }) === 2n
    ).toBeTruthy();
    expect(
        collapseFraction({ numerator: 39n, denominator: 39n }) === 1n
    ).toBeTruthy();
});

test('if the denominator does not divide the numerator, collapseFraction should round up the result ', () => {
    const fraction = { numerator: 13n, denominator: 3n };
    expect(collapseFraction(fraction) === 5n).toBeTruthy();
});

test('Extra tests for collapseFraction with non-integer quotients', () => {
    expect(
        collapseFraction({ numerator: 39n, denominator: 12n }) === 4n
    ).toBeTruthy();
    expect(
        collapseFraction({ numerator: 100n, denominator: 3n }) === 34n
    ).toBeTruthy();
    expect(
        collapseFraction({ numerator: 514n, denominator: 4n }) === 129n
    ).toBeTruthy();
    expect(
        collapseFraction({ numerator: 40n, denominator: 39n }) === 2n
    ).toBeTruthy();
});

test('if the denominator is larger than the numerator, collapseFraction should return 1. ', () => {
    const fraction = { numerator: 13n, denominator: 1000n };
    expect(collapseFraction(fraction) === 1n).toBeTruthy();
});

test('if the denominator is zero, collapseFraction fails', () => {
    const fraction = { numerator: 13n, denominator: 0n };
    expect(() => collapseFraction(fraction)).toThrow();
});
