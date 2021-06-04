import { instanceOfTransferToPublic, TransferToPublic } from '../types';
import TransferHandler from './TransferHandler';
import { AccountTransactionHandler } from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

type TransactionType = TransferToPublic;

const TYPE = 'Unshield GTU';

export default class TransferToPublicHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfTransferToPublic);
    }
}
