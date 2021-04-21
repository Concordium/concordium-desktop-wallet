const types = {
    BigInt: 'bigint',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stringify(input: any) {
    return JSON.stringify(input, (_, v) => {
        if (typeof v === types.BigInt) {
            return { '@type': types.BigInt, value: v.toString() };
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
                default:
                    return v;
            }
        }
        return v;
    });
}
