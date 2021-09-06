import React from 'react';
import { LocationDescriptorObject } from 'history';
import { parse } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import { displayAsGTU } from '~/utils/gtu';
import { parseTime } from '~/utils/timeHelpers';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ButtonNavLink from '~/components/ButtonNavLink';
import DisplayMemo from '~/components/DisplayMemo';

import {
    AddressBookEntry,
    AccountTransaction,
    instanceOfScheduledTransfer,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    instanceOfEncryptedTransfer,
    TimeStampUnit,
} from '~/utils/types';

interface State {
    transaction: string;
    recipient: AddressBookEntry;
    transactionHash?: string;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

function getSpecificsHandler(transaction: AccountTransaction) {
    let amount;
    let title;
    let note;
    let memo;
    if (instanceOfScheduledTransfer(transaction)) {
        title = 'Scheduled Transfer submitted!';
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
        memo = transaction.payload.memo;
    } else if (instanceOfTransferToPublic(transaction)) {
        title = 'Unshield amount submitted!';
        amount = transaction.payload.transferAmount;
    } else if (instanceOfSimpleTransfer(transaction)) {
        title = 'Transfer submitted!';
        amount = transaction.payload.amount;
        memo = transaction.payload.memo;
    } else if (instanceOfTransferToEncrypted(transaction)) {
        title = 'Shield amount submitted!';
        amount = transaction.payload.amount;
    } else if (instanceOfEncryptedTransfer(transaction)) {
        title = 'Shielded transfer submitted!';
        amount = transaction.payload.plainTransferAmount;
        memo = transaction.payload.memo;
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
export default function FinalPage({ location }: Props): JSX.Element {
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
        <>
            <h3 className="textCenter mB0">{handler.title}</h3>
            <h1 className="textCenter mT10 mB0">
                {displayAsGTU(handler.amount)}
            </h1>
            <DisplayEstimatedFee
                className="mT0"
                estimatedFee={transaction.estimatedFee}
            />
            {handler.note}
            {displayRecipient(recipient)}

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
        </>
    );
}
