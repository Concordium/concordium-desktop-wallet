import { instanceOfTransferToEncrypted, TransferToEncrypted } from '../types';
import TransferHandler from './TransferHandler';
import { AccountTransactionHandler } from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

type TransactionType = TransferToEncrypted;

const TYPE = 'Shield CCD';

export default class TransferToEncryptedHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfTransferToEncrypted);
    }
}
