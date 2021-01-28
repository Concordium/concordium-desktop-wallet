/* eslint-disable import/prefer-default-export */
// This is a helper function file, so we do not want to use default export

/**
 * Partitions the array according to the given criteria
 * function.
 * Return [ Matching, NonMatching ]
 */
export function partition<T>(array: T[], criteria: (T) => boolean): [T[], T[]] {
    return [
        array.filter((item) => criteria(item)),
        array.filter((item) => !criteria(item)),
    ];
}
