import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Account, AccountInfo, Fraction } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import { getAccountInfoOfAddress } from '~/utils/nodeHelpers';
import { validateAmount } from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import { getGTUSymbol } from '~/utils/gtu';
import InlineNumber from '~/components/Form/InlineNumber';
import ErrorMessage from '~/components/Form/ErrorMessage';
import styles from './PickAmount.module.scss';

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
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();

    useEffect(() => {
        getAccountInfoOfAddress(account.address)
            .then((loadedAccountInfo) => setAccountInfo(loadedAccountInfo))
            .catch(() => {});
    }, [account, setAccountInfo]);

    useEffect(() => {
        const validation = validateAmount(
            amount,
            accountInfo,
            estimatedFee && collapseFraction(estimatedFee)
        );
        setError(validation);
        setReady(!validation);
    }, [amount, setReady, accountInfo, estimatedFee]);

    return (
        <div className="flexColumn">
            <AccountCard account={account} accountInfo={accountInfo} />
            <h5 className="mB0">Amount:</h5>
            <div className={clsx(styles.inputWrapper)}>
                {getGTUSymbol()}{' '}
                <InlineNumber
                    value={amount}
                    onChange={setAmount}
                    allowFractions
                    ensureDigits={2}
                    isInvalid={Boolean(error)}
                />
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
