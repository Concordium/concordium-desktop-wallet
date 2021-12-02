import { instanceOfEncryptedTransfer, EncryptedTransfer } from '../types';
import TransferHandler from './TransferHandler';
import { AccountTransactionHandler } from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

type TransactionType = EncryptedTransfer;

const TYPE = 'Send shielded CCD';

export default class EncryptedTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfEncryptedTransfer);
    }
}
