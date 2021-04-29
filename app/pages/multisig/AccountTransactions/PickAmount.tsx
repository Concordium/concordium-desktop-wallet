import React, { useState } from 'react';
import { Account, Fraction } from '~/utils/types';
import AccountListElement from '~/components/AccountListElement';
import Input from '~/components/Form/Input';
import styles from './MultisignatureAccountTransactions.module.scss';
import { validateAmount } from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import { useAccountInfo } from '~/utils/hooks';

interface Props {
    setReady: (ready: boolean) => void;
    account: Account | undefined;
    estimatedFee?: Fraction;
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
    const accountInfo = useAccountInfo(account.address);

    function validate(amountString: string) {
        const validation = validateAmount(
            amountString,
            accountInfo,
            estimatedFee && collapseFraction(estimatedFee)
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
