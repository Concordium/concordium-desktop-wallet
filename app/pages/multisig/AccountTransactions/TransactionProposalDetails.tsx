import React from 'react';
import { Account, Identity, AddressBookEntry, Fraction } from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import styles from './MultisignatureAccountTransactions.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

interface Props {
    account?: Account;
    identity?: Identity;
    amount?: string;
    recipient?: AddressBookEntry;
    estimatedFee?: Fraction;
}

const placeholderText = 'To be determined';

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    estimatedFee,
}: Props) {
    return (
        <div className={styles.details}>
            <b>Identity:</b>
            <h2>{identity ? identity.name : placeholderText}</h2>
            <b>Account:</b>
            <h2>{account ? account.name : placeholderText}</h2>
            <b>Amount:</b>
            <h2>{amount ? `${getGTUSymbol()} ${amount}` : placeholderText}</h2>
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <b>Recipient:</b>
            <h2>{recipient ? recipient.name : placeholderText}</h2>
            {recipient ? `Note: ${recipient.note}` : null}
        </div>
    );
}
