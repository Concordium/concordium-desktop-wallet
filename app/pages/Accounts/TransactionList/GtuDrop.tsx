import clsx from 'clsx';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import Button from '~/cross-app-components/Button';
import { insertTransactions } from '~/database/TransactionDao';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { reloadTransactions } from '~/features/TransactionSlice';
import { displayTargetNet, getTargetNet } from '~/utils/ConfigHelper';
import { gtuDrop } from '~/utils/httpRequests';
import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';
import {
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import styles from './TransactionList.module.scss';

const gtuDropAmount = '2000000000';

/**
 * Sends a GTU drop request to the wallet proxy. If successful a pending
 * transaction for the GTU drop is inserted into the database, and the
 * local state is updated so that the transaction will be displayed.
 * @param the account address to request the GTU drop for
 */
async function handleGtuDrop(
    dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
    address?: string
) {
    if (!address) {
        return;
    }

    let submissionId: string;
    try {
        submissionId = await gtuDrop(address);
    } catch {
        setError(
            'The GTU drop service was not reachable. Please try again later.'
        );
        return;
    }

    try {
        const gtuDropTransaction: TransferTransaction = {
            transactionHash: submissionId,
            transactionKind: TransactionKindString.Transfer,
            toAddress: address,
            fromAddress: '',
            status: TransactionStatus.Pending,
            blockHash: submissionId,
            blockTime: secondsSinceUnixEpoch(new Date()).toString(),
            subtotal: gtuDropAmount,
        };
        await insertTransactions([gtuDropTransaction]);
    } catch {
        setError(
            'An internal error occurred. Please try again. If the problem persists, please contact support.'
        );
        return;
    }

    dispatch(reloadTransactions());
}

/**
 * Component that is used to inform the user about the option
 * to get a GTU drop, and to ask the wallet proxy for the GTU
 * drop transfer to the current account.
 */
export default function GtuDrop() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const netName = displayTargetNet(getTargetNet());
    const [error, setError] = useState<string>();

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="An error occurred"
                content={error}
                onClick={() => setError(undefined)}
            />
            <div
                className={clsx(
                    'flexColumn justifyCenter mV0 pV20',
                    styles.thickBlueSeparatorTop,
                    styles.cardPadding
                )}
            >
                <h3 className="textCenter mV0">{netName} GTU drop</h3>
                <p>
                    On the Concordium {netName} you can request some GTU to be
                    deposited to an account to get you started.
                </p>
                <Button
                    onClick={() =>
                        handleGtuDrop(dispatch, setError, account?.address)
                    }
                >
                    Request GTU
                </Button>
            </div>
        </>
    );
}
