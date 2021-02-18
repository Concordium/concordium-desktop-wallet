/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    stringify as bigIntStringify,
    parse as bigIntParse,
} from 'json-bigint';

export function stringify(value: any) {
    return bigIntStringify(value);
}

/**
 * Parses JSON to an object using the json-bigint parse method, with the addition
 * of a reviver function for Buffers. We use this because transactions can contain
 * Buffers and they are serialized as JSON in the database.
 */
export function parse(text: string) {
    return bigIntParse(text, (_, v) => {
        if (
            v !== null &&
            typeof v === 'object' &&
            'type' in v &&
            v.type === 'Buffer' &&
            'data' in v &&
            Array.isArray(v.data)
        ) {
            return Buffer.from(v.data);
        }
        return v;
    });
}
