import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import {
    SimpleTransferWithMemo,
    AccountTransaction,
    TransactionKindId,
    SimpleTransfer,
    TransferToEncrypted,
    instanceOfSimpleTransfer,
    instanceOfScheduledTransfer,
    instanceOfTransferToEncrypted,
    TransferToPublic,
    instanceOfTransferToPublic,
    instanceOfEncryptedTransfer,
    instanceOfAddBaker,
    AddBaker,
    instanceOfRemoveBaker,
    RemoveBaker,
    instanceOfUpdateBakerKeys,
    UpdateBakerKeys,
    UpdateBakerStake,
    instanceOfUpdateBakerStake,
    instanceOfUpdateBakerRestakeEarnings,
    UpdateBakerRestakeEarnings,
    instanceOfSimpleTransferWithMemo,
    instanceOfScheduledTransferWithMemo,
    instanceOfEncryptedTransferWithMemo,
    instanceOfRegisterData,
    RegisterData,
    ConfigureBaker,
    ConfigureDelegation,
    instanceOfConfigureBaker,
    instanceOfConfigureDelegation,
    ConfigureBakerPayload,
} from '~/utils/types';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
    serializeTransferToPublicData,
    serializeAddBaker,
    serializeBakerVerifyKeys,
    serializeAddBakerProofsStakeRestake,
    serializeRemoveBaker,
    serializeUpdateBakerKeys,
    serializeBakerKeyProofs,
    serializeUpdateBakerStake,
    serializeUpdateBakerRestakeEarnings,
    serializeRegisterData,
    serializeConfigureBaker,
    serializeConfigureDelegation,
    serializeConfigureBakerPayload,
    getSerializedMetadataUrlWithLength,
} from '~/utils/transactionSerialization';
import pathAsBuffer from './Path';
import {
    encodeWord16,
    encodeWord64,
    base58ToBuffer,
    putHexString,
} from '../../utils/serializationHelpers';
import { chunkBuffer, isDefined } from '~/utils/basicHelpers';
import { encodeAsCBOR } from '~/utils/cborHelper';
import {
    signEncryptedTransfer,
    signEncryptedTransferWithMemo,
} from './EncryptedTransfer';
import {
    signTransferWithSchedule,
    signTransferWithScheduleAndMemo,
} from './ScheduledTransfer';
import sendMemo from './Memo';

const INS_SIMPLE_TRANSFER = 0x02;
const INS_TRANSFER_TO_ENCRYPTED = 0x11;
const INS_TRANSFER_TO_PUBLIC = 0x12;
const INS_ADD_OR_UPDATE_BAKER = 0x13;
const INS_REMOVE_BAKER = 0x14;
const INS_UPDATE_BAKER_STAKE = 0x15;
const INS_UPDATE_BAKER_RESTAKE_EARNINGS = 0x16;
const INS_SIMPLE_TRANSFER_WITH_MEMO = 0x32;
const INS_REGISTER_DATA = 0x35;
const INS_CONFIGURE_DELEGATION = 0x17;
const INS_CONFIGURE_BAKER = 0x18;

async function signSimpleTransfer(
    transport: Transport,
    path: number[],
    transaction: SimpleTransfer
): Promise<Buffer> {
    const payload = serializeTransferPayload(
        TransactionKindId.Simple_transfer,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const data = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_SIMPLE_TRANSFER,
        p1,
        p2,
        data
    );
    return response.slice(0, 64);
}

async function signSimpleTransferWithMemo(
    transport: Transport,
    path: number[],
    transaction: SimpleTransferWithMemo
): Promise<Buffer> {
    const payload = serializeTransferPayload(
        TransactionKindId.Simple_transfer_with_memo,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const memoLength = encodeAsCBOR(transaction.payload.memo).length;

    const initialPayload = Buffer.concat([
        Buffer.from(Uint8Array.of(TransactionKindId.Simple_transfer_with_memo)),
        base58ToBuffer(transaction.payload.toAddress),
        encodeWord16(memoLength),
    ]);

    const data = Buffer.concat([pathAsBuffer(path), header, initialPayload]);

    let p1 = 0x01;
    const p2 = 0x00;

    await transport.send(0xe0, INS_SIMPLE_TRANSFER_WITH_MEMO, p1, p2, data);

    p1 = 0x02;

    await sendMemo(
        transport,
        INS_SIMPLE_TRANSFER_WITH_MEMO,
        p1,
        p2,
        transaction.payload.memo
    );

    p1 = 0x03;

    const response = await transport.send(
        0xe0,
        INS_SIMPLE_TRANSFER_WITH_MEMO,
        p1,
        p2,
        encodeWord64(BigInt(transaction.payload.amount))
    );

    return response.slice(0, 64);
}

async function signTransferToEncrypted(
    transport: Transport,
    path: number[],
    transaction: TransferToEncrypted
) {
    const payload = serializeTransferPayload(
        TransactionKindId.Transfer_to_encrypted,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const data = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_TRANSFER_TO_ENCRYPTED,
        p1,
        p2,
        data
    );
    return response.slice(0, 64);
}

async function signTransferToPublic(
    transport: Transport,
    path: number[],
    transaction: TransferToPublic
) {
    if (!transaction.payload.proof) {
        throw new Error('Unexpected missing proof');
    }

    const payload = serializeTransferPayload(
        TransactionKindId.Transfer_to_public,
        transaction.payload
    );

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const kind = Buffer.alloc(1);
    kind.writeInt8(TransactionKindId.Transfer_to_public, 0);

    const data = Buffer.concat([pathAsBuffer(path), header, kind]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_TRANSFER_TO_PUBLIC, p1, p2, data);

    p1 = 0x01;
    const proof: Buffer = Buffer.from(transaction.payload.proof, 'hex');

    await transport.send(
        0xe0,
        INS_TRANSFER_TO_PUBLIC,
        p1,
        p2,
        Buffer.concat([
            Buffer.from(serializeTransferToPublicData(transaction.payload)),
            encodeWord16(proof.length),
        ])
    );

    p1 = 0x02;

    let response;
    const chunks = chunkBuffer(proof, 255);
    for (let i = 0; i < chunks.length; i += 1) {
        response = await transport.send(
            0xe0,
            INS_TRANSFER_TO_PUBLIC,
            p1,
            p2,
            Buffer.from(chunks[i])
        );
    }
    if (!response) {
        throw new Error('Unexpected missing response from Ledger');
    }
    return response.slice(0, 64);
}

async function signAddBaker(
    transport: Transport,
    path: number[],
    transaction: AddBaker
): Promise<Buffer> {
    const payload = serializeAddBaker(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const part1 = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(TransactionKindId.Add_baker)),
    ]);

    const part2 = serializeBakerVerifyKeys(transaction.payload);
    const part3 = serializeAddBakerProofsStakeRestake(transaction.payload);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part1);
    p1 = 0x01;
    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part2);
    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_ADD_OR_UPDATE_BAKER,
        p1,
        p2,
        part3
    );

    return response.slice(0, 64);
}

async function signUpdateBakerKeys(
    transport: Transport,
    path: number[],
    transaction: UpdateBakerKeys
): Promise<Buffer> {
    const payload = serializeUpdateBakerKeys(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const part1 = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(TransactionKindId.Update_baker_keys)),
    ]);

    const part2 = serializeBakerVerifyKeys(transaction.payload);
    const part3 = serializeBakerKeyProofs(transaction.payload);

    let p1 = 0x00;
    const p2 = 0x01;
    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part1);
    p1 = 0x01;
    await transport.send(0xe0, INS_ADD_OR_UPDATE_BAKER, p1, p2, part2);
    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_ADD_OR_UPDATE_BAKER,
        p1,
        p2,
        part3
    );

    return response.slice(0, 64);
}

async function signRemoveBaker(
    transport: Transport,
    path: number[],
    transaction: RemoveBaker
): Promise<Buffer> {
    const payload = serializeRemoveBaker();

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(TransactionKindId.Remove_baker)),
    ]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_REMOVE_BAKER,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
}

async function signUpdateBakerStake(
    transport: Transport,
    path: number[],
    transaction: UpdateBakerStake
): Promise<Buffer> {
    const payload = serializeUpdateBakerStake(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_UPDATE_BAKER_STAKE,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
}

async function signUpdateBakerRestakeEarnings(
    transport: Transport,
    path: number[],
    transaction: UpdateBakerRestakeEarnings
): Promise<Buffer> {
    const payload = serializeUpdateBakerRestakeEarnings(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_UPDATE_BAKER_RESTAKE_EARNINGS,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
}

async function signRegisterData(
    transport: Transport,
    path: number[],
    transaction: RegisterData
): Promise<Buffer> {
    const payload = serializeRegisterData(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const data = encodeAsCBOR(transaction.payload.data);

    const cdata = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(TransactionKindId.Register_data)),
        encodeWord16(data.length),
    ]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_REGISTER_DATA, p1, p2, cdata);

    p1 = 0x01;

    const chunks = chunkBuffer(data, 255);
    let response;
    for (const chunk of chunks) {
        response = await transport.send(
            0xe0,
            INS_REGISTER_DATA,
            p1,
            p2,
            Buffer.from(chunk)
        );
    }

    if (!response) {
        throw new Error('Unexpected missing response from Ledger');
    }

    return response.slice(0, 64);
}

async function signConfigureBaker(
    transport: Transport,
    path: number[],
    transaction: ConfigureBaker
): Promise<Buffer> {
    let p1 = 0x00;
    const p2 = 0x00;
    let response: Buffer;

    const send = (cdata: Buffer | undefined) =>
        transport.send(0xe0, INS_CONFIGURE_BAKER, p1, p2, cdata);

    const payload = serializeConfigureBaker(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const bitmap = serializeConfigureBakerPayload(transaction.payload).slice(
        0,
        2
    ); // first 2 bytes are the bitmap

    const meta = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(TransactionKindId.Configure_baker)),
        bitmap,
    ]);

    response = await send(meta);

    const {
        metadataUrl,
        stake,
        restakeEarnings,
        openForDelegation,
        keys,
        suspended,
        ...commissions
    } = transaction.payload;

    const dataPayload: ConfigureBakerPayload = {
        stake,
        restakeEarnings,
        openForDelegation,
    };

    if (Object.values(dataPayload).some(isDefined) || keys !== undefined) {
        p1 = 0x01;
        let data = serializeConfigureBakerPayload(dataPayload).slice(2); // first 2 bytes are the bitmap

        if (keys !== undefined) {
            data = Buffer.concat([
                data,
                putHexString(keys.electionVerifyKey),
                putHexString(keys.proofElection),
                putHexString(keys.signatureVerifyKey),
                putHexString(keys.proofSig),
            ]);
        }

        response = await send(data);
    }

    if (keys !== undefined) {
        p1 = 0x02;
        const aggKey = Buffer.concat([
            putHexString(keys.aggregationVerifyKey),
            putHexString(keys.proofAggregation),
        ]);
        response = await send(aggKey);
    }

    if (metadataUrl !== undefined) {
        const {
            data: urlBuffer,
            length: urlLength,
        } = getSerializedMetadataUrlWithLength(metadataUrl);

        p1 = 0x03;
        response = await send(urlLength);

        p1 = 0x04;
        const chunks = chunkBuffer(urlBuffer, 255);

        for (let i = 0; i < chunks.length; i += 1) {
            response = await send(Buffer.from(chunks[i]));
        }
    }

    if (Object.values(commissions).some(isDefined)) {
        p1 = 0x05;
        const comms = serializeConfigureBakerPayload(commissions).slice(2);
        response = await send(comms);
    }

    if (suspended !== undefined) {
        p1 = 0x06;
        response = await send(Buffer.from([Number(suspended)]));
    }

    return response.slice(0, 64);
}

async function signConfigureDelegation(
    transport: Transport,
    path: number[],
    transaction: ConfigureDelegation
): Promise<Buffer> {
    const payload = serializeConfigureDelegation(transaction.payload);

    const header = serializeTransactionHeader(
        transaction.sender,
        transaction.nonce,
        transaction.energyAmount,
        payload.length,
        transaction.expiry
    );

    const cdata = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(
        0xe0,
        INS_CONFIGURE_DELEGATION,
        p1,
        p2,
        cdata
    );

    return response.slice(0, 64);
}

export default async function signTransfer(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    if (instanceOfSimpleTransferWithMemo(transaction)) {
        return signSimpleTransferWithMemo(transport, path, transaction);
    }
    if (instanceOfSimpleTransfer(transaction)) {
        return signSimpleTransfer(transport, path, transaction);
    }
    if (instanceOfScheduledTransfer(transaction)) {
        return signTransferWithSchedule(transport, path, transaction);
    }
    if (instanceOfScheduledTransferWithMemo(transaction)) {
        return signTransferWithScheduleAndMemo(transport, path, transaction);
    }
    if (instanceOfTransferToEncrypted(transaction)) {
        return signTransferToEncrypted(transport, path, transaction);
    }
    if (instanceOfTransferToPublic(transaction)) {
        return signTransferToPublic(transport, path, transaction);
    }
    if (instanceOfEncryptedTransferWithMemo(transaction)) {
        return signEncryptedTransferWithMemo(transport, path, transaction);
    }
    if (instanceOfEncryptedTransfer(transaction)) {
        return signEncryptedTransfer(transport, path, transaction);
    }
    if (instanceOfAddBaker(transaction)) {
        return signAddBaker(transport, path, transaction);
    }
    if (instanceOfUpdateBakerKeys(transaction)) {
        return signUpdateBakerKeys(transport, path, transaction);
    }
    if (instanceOfRemoveBaker(transaction)) {
        return signRemoveBaker(transport, path, transaction);
    }
    if (instanceOfUpdateBakerStake(transaction)) {
        return signUpdateBakerStake(transport, path, transaction);
    }
    if (instanceOfUpdateBakerRestakeEarnings(transaction)) {
        return signUpdateBakerRestakeEarnings(transport, path, transaction);
    }
    if (instanceOfRegisterData(transaction)) {
        return signRegisterData(transport, path, transaction);
    }
    if (instanceOfConfigureBaker(transaction)) {
        return signConfigureBaker(transport, path, transaction);
    }
    if (instanceOfConfigureDelegation(transaction)) {
        return signConfigureDelegation(transport, path, transaction);
    }
    throw new Error(
        `The received transaction was not a supported transaction type`
    );
}
