import React, { useState, useEffect } from 'react';
import { Account, AccountInfo } from '~/utils/types';
import AccountListElement from '~/components/AccountListElement';
import { getAccountInfoOfAddress } from '~/utils/nodeHelpers';
import Input from '~/components/Form/Input';
import styles from './MultisignatureAccountTransactions.module.scss';
import { validateAmount } from '~/utils/transactionHelpers';

interface Props {
    setReady: (ready: boolean) => void;
    account: Account | undefined;
    estimatedFee?: bigint;
    amount: string;
    setAmount: (amount: string) => void;
}

/**
 * Allow the user to input amount,
 * and displays the given account's information.
 */
export default function PickAmount({
    account,
    setAmount,
    amount,
    estimatedFee,
    setReady,
}: Props): JSX.Element {
    if (!account) {
        throw new Error('Unexpected missing account');
    }

    const [error, setError] = useState<string>();
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();

    useEffect(() => {
        getAccountInfoOfAddress(account.address)
            .then((loadedAccountInfo) => setAccountInfo(loadedAccountInfo))
            .catch(() => {});
    }, [account, setAccountInfo]);

    function validate(amountString: string) {
        const validation = validateAmount(
            amountString,
            accountInfo,
            estimatedFee
        );
        setError(validation);
        setReady(!validation);
    }

    return (
        <div className={styles.pickAmount}>
            <AccountListElement account={account} accountInfo={accountInfo} />
            <Input
                name="amount"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => {
                    const newAmount = e.target.value;
                    setAmount(newAmount);
                    validate(newAmount);
                }}
            />
            <p className={styles.errorLabel}>{error}</p>
        </div>
    );
}
