import { parse, stringify } from '../../app/utils/JSONHelper';

test('parse/stringify handles a number', () => {
    const x = 5;
    expect(parse(stringify(x))).toBe(x);
});

test('parse/stringify handles a bigint', () => {
    const x = BigInt(5);
    expect(typeof parse(stringify(x))).toBe('bigint');
});
