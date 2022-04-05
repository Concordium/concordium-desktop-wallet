import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '~/utils/transactionTypes';
import { createRegisterDataTransaction } from '../transactionHelpers';
import { instanceOfRegisterData, RegisterData } from '../types';
import TransferHandler from './TransferHandler';

const TYPE = 'Register data';

type TransactionType = RegisterData;

export default class RegisterDataHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfRegisterData);
    }

    createTransaction({
        sender,
        data,
        signatureAmount,
        nonce,
        expiryTime,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !data || !nonce) {
            throw new Error(
                `Unexpected Missing input: ${sender}, ${data}, ${nonce}`
            );
        }
        return createRegisterDataTransaction(
            sender,
            nonce,
            data,
            signatureAmount,
            expiryTime
        );
    }
}
