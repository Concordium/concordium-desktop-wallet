import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { SerializedDescription, Description } from '~/utils/types';
import { chunkBuffer } from '~/utils/basicHelpers';
import { getSerializedDescription } from '~/utils/serializationHelpers';

/**
 * Sends the given description for signing.
 * Sends the description parts' lengths using the given p1 code and the the parts' contents with p1 code "p1 + 1".
 */
export default async function sendDescription(
    transport: Transport,
    ins: number,
    p1: number,
    p2: number,
    description: Description
) {
    const serializedDescription = getSerializedDescription(description);

    for (const text of ['name', 'url', 'description']) {
        // Send description
        const descriptionLengthData =
            serializedDescription[text as keyof SerializedDescription].length;
        await transport.send(0xe0, ins, p1, p2, descriptionLengthData);

        // Stream the description bytes (maximum of 255 bytes per packet)
        const descriptionChunks = chunkBuffer(
            serializedDescription[text as keyof SerializedDescription].data,
            255
        );
        for (const chunk of descriptionChunks) {
            await transport.send(0xe0, ins, p1 + 1, p2, Buffer.from(chunk));
        }
    }
}
