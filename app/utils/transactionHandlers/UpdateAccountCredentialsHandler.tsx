import React from 'react';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import { AccountTransactionHandler } from '../transactionTypes';
import {
    UpdateAccountCredentials,
    instanceOfUpdateAccountCredentials,
    TransactionKindId,
} from '../types';
import routes from '~/constants/routes.json';
import { noOp } from '../basicHelpers';
import TransferHandler from './TransferHandler';

const TYPE = 'Update account credentials';

type TransactionType = UpdateAccountCredentials;

export default class UpdateAccountCredentialsHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    constructor() {
        super(TYPE, instanceOfUpdateAccountCredentials);
    }

    creationLocationHandler(currentLocation: string) {
        const getNewLocation = () => {
            switch (currentLocation) {
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY;
                case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
                    return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
                default:
                    throw new Error('unknown location');
            }
        };
        return getNewLocation().replace(
            ':transactionKind',
            `${TransactionKindId.Update_credentials}`
        );
    }

    async signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput,
        displayMessage: (message: string | JSX.Element) => void = noOp
    ) {
        return ledger.signUpdateCredentialTransaction(
            transaction,
            getAccountPath(path),
            (key) => {
                displayMessage(
                    <>
                        <b>Public key:</b>
                        <p className="m0">{key}</p>
                    </>
                );
            },
            () => displayMessage('Please verify transaction details')
        );
    }
}
