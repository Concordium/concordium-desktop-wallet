import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountTransactionHandler } from '~/utils/transactionTypes';
import { instanceOfRegisterData, RegisterData } from '../types';
import TransferHandler from './TransferHandler';

const TYPE = 'Register Data';

type TransactionType = RegisterData;

export default class RegisterDataHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfRegisterData);
    }
}
