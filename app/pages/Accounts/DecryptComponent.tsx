import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decryptAccountBalance } from '~/features/AccountSlice';
import { globalSelector } from '~/features/GlobalSlice';
import {
    transactionsSelector,
    decryptTransactions,
    loadTransactions,
} from '~/features/TransactionSlice';
import { Account } from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
import errorMessages from '~/constants/errorMessages.json';

interface Props {
    account: Account;
}

/**
 * Wrapper for the ledger component, for decrypting the account'
 * shielded balance and transactions.
 */
export default function DecryptComponent({ account }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);
    const global = useSelector(globalSelector);

    async function ledgerCall(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!global) {
            throw new Error(errorMessages.missingGlobal);
        }

        if (account.identityNumber === undefined) {
            throw new Error(
                'The account is missing an identity number. This is an internal error that should be reported'
            );
        }

        const credential = await findLocalDeployedCredentialWithWallet(
            account.address,
            ledger
        );
        if (credential === undefined) {
            throw new Error(
                'Unable to decrypt shielded balance and encrypted transfers. Please verify that the connected wallet is for this account.'
            );
        }
        const { credentialNumber } = credential;

        setMessage('Please confirm exporting PRF key on device');
        const prfKeySeed = await ledger.getPrfKey(credential.identityNumber);
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');

        await decryptTransactions(
            transactions,
            prfKey,
            credentialNumber,
            global
        );
        await decryptAccountBalance(
            prfKey,
            account,
            credentialNumber,
            global,
            dispatch
        );
        await loadTransactions(account, dispatch);
    }

    return (
        <Ledger ledgerCallback={ledgerCall}>
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <Card className="flexColumn textCenter">
                    <h3 className="mB40">Decrypt shielded balance</h3>
                    {statusView}
                    <Button
                        size="big"
                        disabled={!isReady}
                        className="m40"
                        onClick={submitHandler}
                    >
                        Decrypt
                    </Button>
                </Card>
            )}
        </Ledger>
    );
}
