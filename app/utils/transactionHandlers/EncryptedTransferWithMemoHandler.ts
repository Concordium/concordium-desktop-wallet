import {
    instanceOfEncryptedTransferWithMemo,
    EncryptedTransferWithMemo,
} from '../types';
import TransferHandler from './TransferHandler';
import { AccountTransactionHandler } from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

type TransactionType = EncryptedTransferWithMemo;

const TYPE = 'Send shielded GTU';

export default class EncryptedTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfEncryptedTransferWithMemo);
    }
}
