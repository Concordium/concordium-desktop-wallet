// eslint-disable-next-line import/prefer-default-export
export const getFoundationTransactionPageTitle = (transactionType: string) =>
    `Foundation Transaction | ${transactionType}`;

/** Splits a string into a array of substring chunks of a given size,
 *  where the last chunk being possibly smaller */
export function chunk(str: string, chunkSize: number) {
    const totalChunks = Math.ceil(str.length / chunkSize);
    const chunks = new Array(totalChunks);

    for (let i = 0, o = 0; i < totalChunks; i += 1, o += chunkSize) {
        chunks[i] = str.substr(o, chunkSize);
    }

    return chunks;
}
