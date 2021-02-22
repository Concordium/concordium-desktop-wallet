import { isHex, partition, toCSV } from '../../app/utils/basicHelpers';

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
