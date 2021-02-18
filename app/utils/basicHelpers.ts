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
 * Given a list of elements, a function to parse the elements to string array,
 * and the names of the elements' fields, outputs
 * csv string, with the names first, and the values of each element per line.
 */
export function toCSV(elements: string[][], fieldNames: string[]): string {
    if (elements.find((element) => element.length !== fieldNames.length)) {
        throw new Error('invalid formatted input');
    }

    return `${fieldNames.join(',')}\n${elements
        .map((element) => element.join(','))
        .join('\n')}`;
}
