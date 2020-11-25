import type Transport from '@ledgerhq/hw-transport';
import { AccountTransaction, TransactionKind } from '../../utils/types';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
} from '../../utils/transactionSerialization';
import pathAsBuffer from './Path';

const INS_SIMPLE_TRANSFER = 0x02;

export default async function signTransfer(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<{ signature: Buffer }> {
    if (transaction.transactionKind !== TransactionKind.Simple_transfer) {
        throw new Error(
            `The received transaction was not a transfer transaction: ${transaction.transactionKind}`
        );
    }

    const payload = serializeTransferPayload(
        TransactionKind.Simple_transfer,
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
    const signature = response.slice(0, 64);

    return { signature };
}
