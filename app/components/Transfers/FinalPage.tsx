import React from 'react';
import { LocationDescriptorObject } from 'history';
import { parse } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import { displayAsGTU } from '~/utils/gtu';
import { parseTime } from '~/utils/timeHelpers';
import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ButtonNavLink from '~/components/ButtonNavLink';

import {
    AddressBookEntry,
    AccountTransaction,
    instanceOfScheduledTransfer,
    instanceOfSimpleTransfer,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
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
    if (instanceOfScheduledTransfer(transaction)) {
        title = 'Transfer submitted!';
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
        title = 'Unshielding submitted!';
        amount = transaction.payload.transferAmount;
    } else if (instanceOfSimpleTransfer(transaction)) {
        title = 'Transfer submitted!';
        amount = transaction.payload.amount;
    } else if (instanceOfTransferToEncrypted(transaction)) {
        title = 'Shielding submitted!';
        amount = transaction.payload.amount;
    } else {
        throw new Error(
            `Unsupported transaction type - please implement: ${transaction}`
        );
    }
    return { amount, title, note };
}

function displayRecipient(recipient: AddressBookEntry) {
    if (recipient) {
        return <h3 className="textCenter">To: {recipient.name}</h3>;
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
            <h3 className="pT20 textCenter">{handler.title}</h3>
            <h1 className="textCenter mB0">{displayAsGTU(handler.amount)}</h1>
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            {handler.note}
            {displayRecipient(recipient)}
            <h3 className="textCenter">Transaction hash: {transactionHash}</h3>
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
