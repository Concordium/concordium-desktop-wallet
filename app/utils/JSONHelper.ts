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

/**
 * Given a JSON string, changes the type of the entries with the given key from number to strings.
 * Can be used before parsing json with numbers, which can be larger than the MAX_SAFE_INTEGER
 * to avoid data-loss, from the automatic conversion to a number.
 * N.B. will only change fields that are actually numbers.
 * @param jsonStruct: A string that containts a JSON struct.x
 * @param key: the key of the key-value pair, which should be converted from a number to a string.
 */
export function intToString(jsonStruct: string, key: string) {
    return jsonStruct.replace(
        new RegExp(`"${key}":\\s*([0-9]+)`, 'g'),
        `"${key}":"$1"`
    );
}
