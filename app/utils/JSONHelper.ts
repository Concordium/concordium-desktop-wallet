const types = {
    BigInt: 'bigint',
    Buffer: 'Buffer',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringify(input: any) {
    return JSON.stringify(input, (_, v) => {
        if (typeof v === types.BigInt) {
            return { '@type': types.BigInt, value: v.toString() };
        }
        if (v && v.type === types.Buffer) {
            return {
                '@type': types.Buffer,
                value: Buffer.from(v).toString('base64'),
            };
        }
        return v;
    });
}

export function parse(input: string) {
    return JSON.parse(input, (_, v) => {
        if (v) {
            switch (v['@type']) {
                case types.BigInt:
                    return BigInt(v.value);
                case types.Buffer:
                    return Buffer.from(v.value, 'base64');
                default:
                    return v;
            }
        }
        return v;
    });
}
