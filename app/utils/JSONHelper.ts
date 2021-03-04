export function stringify(input: any) {
    return JSON.stringify(input, (_, v) =>
        typeof v === 'bigint' ? { '@type': 'bigint', value: v.toString() } : v
    );
}

export function parse(input: string) {
    return JSON.parse(input, (_, v) =>
        v['@type'] === 'bigint' ? BigInt(v.value) : v
    );
}
