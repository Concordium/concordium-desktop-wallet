import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { parse } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import { displayAsCcd } from '~/utils/ccd';
import { parseTime } from '~/utils/timeHelpers';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ButtonNavLink from '~/components/ButtonNavLink';
import DisplayMemo from './DisplayMemo';
import TransferView from './TransferView';

import {
    AddressBookEntry,
    AccountTransaction,
    instanceOfScheduledTransfer,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    instanceOfEncryptedTransfer,
    TimeStampUnit,
    instanceOfScheduledTransferWithMemo,
    instanceOfEncryptedTransferWithMemo,
    instanceOfSimpleTransferWithMemo,
    instanceOfAddBaker,
    instanceOfRemoveBaker,
    instanceOfUpdateBakerKeys,
    instanceOfUpdateBakerRestakeEarnings,
    instanceOfUpdateBakerStake,
    instanceOfConfigureBaker,
    instanceOfConfigureDelegation,
} from '~/utils/types';

export interface FinalPageLocationState {
    transaction: string;
    recipient?: AddressBookEntry;
    transactionHash?: string;
}

function getSpecificsHandler(transaction: AccountTransaction) {
    let amount;
    let title;
    let note;
    let memo;
    if (
        instanceOfSimpleTransferWithMemo(transaction) ||
        instanceOfScheduledTransferWithMemo(transaction) ||
        instanceOfEncryptedTransferWithMemo(transaction)
    ) {
        memo = transaction.payload.memo;
    }

    if (
        instanceOfScheduledTransfer(transaction) ||
        instanceOfScheduledTransferWithMemo(transaction)
    ) {
        title = 'Scheduled transfer submitted!';
        amount = getScheduledTransferAmount(transaction);
        note = (
            <h3 className="textCenter">
                Split into {transaction.payload.schedule.length} releases,
                starting:
                <br />
                {parseTime(
                    transaction.payload.schedule[0].timestamp,
                    TimeStampUnit.milliSeconds
                )}
            </h3>
        );
    } else if (instanceOfTransferToPublic(transaction)) {
        title = 'Unshield amount submitted!';
        amount = transaction.payload.transferAmount;
    } else if (
        instanceOfSimpleTransfer(transaction) ||
        instanceOfSimpleTransferWithMemo(transaction)
    ) {
        title = 'Transfer submitted!';
        amount = transaction.payload.amount;
    } else if (instanceOfTransferToEncrypted(transaction)) {
        title = 'Shield amount submitted!';
        amount = transaction.payload.amount;
    } else if (
        instanceOfEncryptedTransfer(transaction) ||
        instanceOfEncryptedTransferWithMemo(transaction)
    ) {
        title = 'Shielded transfer submitted!';
        amount = transaction.payload.plainTransferAmount;
    } else if (
        instanceOfAddBaker(transaction) ||
        instanceOfRemoveBaker(transaction) ||
        instanceOfUpdateBakerKeys(transaction) ||
        instanceOfUpdateBakerRestakeEarnings(transaction) ||
        instanceOfUpdateBakerStake(transaction)
    ) {
        title = 'Validator transaction submitted!';
    } else if (instanceOfConfigureBaker(transaction)) {
        title = 'Configure validator transaction submitted!';
    } else if (instanceOfConfigureDelegation(transaction)) {
        title = 'Configure delegation transaction submitted!';
    } else {
        throw new Error(
            `Unsupported transaction type - please implement: ${transaction}`
        );
    }
    return { amount, title, note, memo };
}

function displayRecipient(recipient: AddressBookEntry) {
    if (recipient) {
        return (
            <h3 className="textCenter mT10">
                <b>To:</b> {recipient.name}
            </h3>
        );
    }
    return null;
}

/**
 * Displays details of a submitted transaction.
 */
export default function FinalPage(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation<FinalPageLocationState>();
    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const {
        transaction: transactionJSON,
        recipient,
        transactionHash,
    } = location.state;
    const transaction: AccountTransaction = parse(transactionJSON);
    const handler = getSpecificsHandler(transaction);

    return (
        <TransferView
            showBack={false}
            exitOnClick={() => dispatch(push(routes.ACCOUNTS))}
        >
            <h3 className="textCenter mB0">{handler.title}</h3>
            {handler.amount && (
                <h1 className="textCenter mT10 mB0">
                    {displayAsCcd(handler.amount)}
                </h1>
            )}
            <DisplayEstimatedFee
                className={clsx(handler.amount !== undefined && 'mT0')}
                estimatedFee={transaction.estimatedFee}
            />
            {handler.note}
            {recipient && displayRecipient(recipient)}

            <DisplayMemo className="textCenter" memo={handler.memo} />
            <h3 className="textCenter mT10">
                <b>Transaction hash:</b> {transactionHash}
            </h3>
            <ButtonNavLink
                className="m20"
                size="big"
                inverted={false}
                to={routes.ACCOUNTS}
            >
                Finish
            </ButtonNavLink>
        </TransferView>
    );
}
