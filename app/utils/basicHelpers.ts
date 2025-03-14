import { Buffer } from 'buffer/';
import { Fraction } from './types';

/**
 * Partitions the array according to the given criteria
 * function.
 * Return [ Matching, NonMatching ]
 */
export function partition<T>(
    array: T[],
    criteria: (testee: T) => boolean
): [T[], T[]] {
    return [
        array.filter((item) => criteria(item)),
        array.filter((item) => !criteria(item)),
    ];
}

/**
 * Checks if the input string is a valid hexadecimal string.
 * @param str the string to check for hexadecimal
 */
export function isHex(str: string): boolean {
    return /^[A-F0-9]+$/i.test(str) && str.length % 2 === 0;
}

/**
 * Determines whether or not the input string consists of only digits,
 * with no leading zero (except if only a single digit).
 */
export function onlyDigitsNoLeadingZeroes(value: string): boolean {
    return /^(?:[1-9][0-9]*|0)$/.test(value);
}

/**
 * Takes an array of elements with an arbitary type  and a function to tranform them to bigints.
 * Return the sum as a bigint.
 */
export function sumToBigInt<T>(
    members: T[],
    transform: (member: T) => bigint
): bigint {
    return members.reduce((acc, member) => acc + transform(member), 0n);
}

/**
 * Partitions a generic array into chunks of a certain size. The final
 * chunk may have a different size less than the provided size.
 * @param array the array to chunk
 * @param chunkSize the size of each chunk
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    if (chunkSize <= 0) {
        throw new Error('Chunk size has to be a positive number.');
    }
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Partitions a Buffer into chunks of a certain size. The final chunk
 * may have a different size than the provided size.
 * @param array the Buffer to chunk
 * @param chunkSize the size of each chunk
 */
export function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    if (chunkSize <= 0) {
        throw new Error('Chunk size has to be a positive number.');
    }
    const chunks: Buffer[] = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
        chunks.push(buffer.slice(i, i + chunkSize));
    }
    return chunks;
}

/** Partitions a string into chunks of a certain size, where the last chunk
 * being possibly smaller */
export function chunkString(str: string, chunkSize: number) {
    const totalChunks = Math.ceil(str.length / chunkSize);
    const chunks = new Array(totalChunks);

    for (let i = 0, o = 0; i < totalChunks; i += 1, o += chunkSize) {
        chunks[i] = str.substr(o, chunkSize);
    }

    return chunks;
}

export function isDefined<T>(v?: T): v is T {
    return v !== undefined;
}

export const notNull = <T>(v: T | null | undefined): v is T => v != null;

export function noOp(): void {
    return undefined;
}

export async function asyncNoOp(): Promise<void> {
    return new Promise((resolve) => resolve());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const valueNoOp = <V>(v: V) => v;

export const ensureNumberLength = (length: number) => (
    value?: string
): string => {
    if (!value) {
        return '';
    }

    const valueLength = value.length;

    if (valueLength >= length) {
        return value;
    }

    const missing = length - valueLength;
    const prepend = new Array(missing).fill(`0`).join('');

    return `${prepend}${value}`;
};

/**
 * Collapses the Fraction into a single number.
 * If the denominator does not divide the numerator, the function rounds up;
 */
export function collapseFraction({ numerator, denominator }: Fraction): bigint {
    const quotient = numerator / denominator;
    if (numerator % denominator === 0n) {
        return quotient;
    }
    return 1n + quotient;
}

export function multiplyFraction(
    { numerator, denominator }: Fraction,
    factor: bigint | string
): Fraction {
    return {
        numerator: numerator * BigInt(factor),
        denominator,
    };
}

/**
 * Returns the absolute value of the given bigint.
 */
export function abs(value: bigint) {
    return value < 0n ? -value : value;
}

export function max(first: bigint, second: bigint) {
    return first > second ? first : second;
}

export function isASCII(value: string) {
    // eslint-disable-next-line no-control-regex
    return !/[^\u0000-\u007f]/.test(value);
}

/**
 * Given two function, this returns a function which is their composition.
 * (a , b) => b ∘ a
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pipe<A extends any[], B, C>(
    a: (...args: A) => B,
    b: (arg: B) => C
): (...args: A) => C {
    return (...args) => b(a(...args));
}

export function throwLoggedError(message: string): never {
    const error = new Error(message);
    window.log.error(error);
    throw error;
}

/**
 * Helper to map the values of a record.
 */
export function mapRecordValues<K extends string | number | symbol, V, T>(
    record: Record<K, V>,
    map: (value: V) => T
): Record<K, T> {
    const result = {} as Record<K, T>;
    const entries = Object.entries(record) as [K, V][];
    return entries.reduce((acc, [k, v]) => {
        acc[k as K] = map(v);
        return acc;
    }, result);
}

/**
 * Helper to run a filter on the entries of a record.
 */
export function filterRecordEntries<K extends string | number | symbol, V>(
    record: Record<K, V>,
    filter: (key: K, value: V) => boolean
): Record<K, V> {
    const result = {} as Record<K, V>;
    const entries = Object.entries(record) as [K, V][];
    return entries.reduce((acc, [k, v]) => {
        if (filter(k, v)) {
            acc[k as K] = v;
        }
        return acc;
    }, result);
}

// Maps a `Record<A,C>` to a `Record<B,D>`.
// Works the same way as a list mapping, allowing both a value and key mapping.
// If `keyMapper()` is not provided, it will map `Record<A,C>` to `Record<A,D>`
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapRecord<
    A extends string | number | symbol,
    B,
    C extends string | number | symbol,
    D
>(
    rec: Record<A, B>,
    valMapper: (x: B) => D,
    keyMapper: (x: A) => C = (a: any) => a
): Record<C, D> {
    const ret: any = {};
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const i in rec) {
        ret[keyMapper(i)] = valMapper(rec[i]);
    }
    return ret;
}

export const UINT32_MAX = 2 ** 32 - 1; // UInt32 upper bound
