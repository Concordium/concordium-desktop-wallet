/* eslint-disable import/prefer-default-export */
// This is a helper function file, so we do not want to use default export

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

export function toCSV<T>(
    elements: T[],
    parseElement: (element: T) => (string | undefined)[],
    fieldNames: string[]
): string {
    return `${fieldNames.join(',')}\n${elements
        .map((element) => parseElement(element).join(','))
        .join('\n')}`;
}
