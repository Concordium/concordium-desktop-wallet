import React, { useState, useEffect } from 'react';
import {
    Account,
    Identity,
    AddressBookEntry,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import styles from './MultisignatureAccountTransactions.module.scss';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

interface Props {
    transactionType: TransactionKindId;
    account: Account | undefined;
    identity: Identity | undefined;
    amount: string | undefined;
    recipient: AddressBookEntry | undefined;
}

const placeholderText = 'To be determined';

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    transactionType,
}: Props) {
    const [estimatedFee, setFee] = useState<Fraction | undefined>();

    useEffect(() => {
        if (account) {
            getTransactionKindCost(transactionType, account.signatureThreshold)
                .then((fee) => setFee(fee))
                .catch(() => {});
        }
    }, [account, transactionType, setFee]);

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
            <br />
        </div>
    );
}
