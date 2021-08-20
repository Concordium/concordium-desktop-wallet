import {
    intToString,
    parse,
    stringify,
    toStringBigInts,
} from '../../app/utils/JSONHelper';

test('parse/stringify handles a number', () => {
    const x = 5;
    expect(parse(stringify(x))).toBe(x);
});

test('parse/stringify handles a bigint', () => {
    const x = BigInt(5);
    expect(typeof parse(stringify(x))).toBe('bigint');
});

test('parse/stringify handles a bigint and preserves the value', () => {
    const x = BigInt(5);
    expect(parse(stringify(x))).toBe(5n);
});

test('parse/stringify should not convert strings, that corresponds bigint literals, to bigints.', () => {
    const x = '5n';
    expect(parse(stringify(x))).toBe('5n');
});

test('parse/stringify should handle a list of bigints and preserves the values', () => {
    const x = [1n, 2n, 5n];
    const y = parse(stringify(x));
    expect(y).toHaveLength(3);
    expect(y[0]).toBe(1n);
    expect(y[1]).toBe(2n);
    expect(y[2]).toBe(5n);
});

test('parse/stringify should handle an object with a bigint field and preserves the value', () => {
    const x = { big: 2n, small: 2, text: '2n' };
    const y = parse(stringify(x));
    expect(y.big).toBe(2n);
    expect(y.small).toBe(2);
    expect(y.text).toBe('2n');
});

test('parse/stringify handles null', () => {
    const x = null;
    expect(parse(stringify(x))).toBeNull();
});

test('parse/stringify handles undefined fields', () => {
    const x = { a: undefined };
    expect(parse(stringify(x)).a).toBeUndefined();
});

test('intToString converts large numbers', () => {
    const json = '{ "nonce": 900719925474099212, "number": 10 }';
    const jsonConverted = intToString(json, 'nonce');
    const parsed = JSON.parse(jsonConverted);
    expect(parsed.nonce).toBe('900719925474099212');
    expect(parsed.number).toBe(10);
});

test('toStringBigInts convert bigint', () => {
    expect(toStringBigInts(1n)).toBe('1');
});

test('toStringBigInts convert does not convert number', () => {
    expect(toStringBigInts(1)).toBe(1);
});

test('toStringBigInts convert bigint field', () => {
    expect(toStringBigInts({ v: 1n })).toStrictEqual({ v: '1' });
});

test('toStringBigInts convert bigint in array', () => {
    expect(toStringBigInts(['a', 1n])).toStrictEqual(['a', '1']);
});

test('toStringBigInts convert bigint field in array', () => {
    expect(toStringBigInts([{ v: 1n }])).toStrictEqual([{ v: '1' }]);
});
