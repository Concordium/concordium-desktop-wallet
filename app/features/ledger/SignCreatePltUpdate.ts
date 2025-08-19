/* eslint-disable no-await-in-loop */
import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { CreatePLTPayload, UpdateInstruction } from '../../utils/types';
import pathAsBuffer from './Path';
import {
    serializeCreatePltParameters,
    serializeUpdateHeader,
    serializeUpdateType,
} from '../../utils/UpdateSerialization';
import { chunkBuffer } from '../../utils/basicHelpers';

const INS_CREATE_PLT = 0x48;

export default async function signUpdateCreatePltTransaction(
    transport: Transport,
    path: number[],
    transaction: UpdateInstruction<CreatePLTPayload>,
    serializedPayload: Buffer
): Promise<Buffer> {
    const updateHeaderWithPayloadSize = {
        ...transaction.header,
        payloadSize: serializedPayload.length + 1, // +1 byte for the instruction type
    };

    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(transaction.type);
    const serializedCreatePltUpdate = serializeCreatePltParameters(
        transaction.payload
    );

    let p1 = 0x00;
    const p2 = 0x00;

    // Send initial packet of data containing derivation path and transaction header.
    // Update type must be 24.
    // 0x48	0x00 0x00 path_length path[uint32]x[5] update_instruction_header[28 bytes] update_type[uint8]
    const initialData = Buffer.concat([
        pathAsBuffer(path),
        serializedHeader,
        serializedUpdateType,
    ]);
    await transport.send(0xe0, INS_CREATE_PLT, p1, p2, initialData);

    // Send part1 packet of data containing token details and initialization parameters length.
    // 0x48	0x01 0x00 token_symbol_length[uint8] [token_symbol[token_symbol_length bytes]] [token_module[32 bytes]] [decimals[uint8]] [initialization_params_length[uint32]]
    p1 = 0x01;
    await transport.send(
        0xe0,
        INS_CREATE_PLT,
        p1,
        p2,
        serializedCreatePltUpdate.part1Buf
    );

    // Stream the initParameter bytes (maximum of 255 bytes per packet).
    // It is sent in batches until the entirety of the initialization parameters (initialization_params_length bytes) has been sent.
    // 0x48	0x02 0x00 initialization_params[1...255 bytes]
    p1 = 0x02;
    const initParamChunks = chunkBuffer(
        serializedCreatePltUpdate.initParamBuf,
        255
    );
    for (let i = 0; i < initParamChunks.length; i += 1) {
        // This command is repeated until all initialization parameter data has been sent.
        const result = await transport.send(
            0xe0,
            INS_CREATE_PLT,
            p1,
            p2,
            initParamChunks[i]
        );

        // Return signature
        if (i === initParamChunks.length - 1) {
            return result.slice(0, 64);
        }
    }

    throw new Error(
        'A signature was not returned by the Ledger device. This can only happen due to an implementation error.'
    );
}
