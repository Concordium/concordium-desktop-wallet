import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import AccountCard from '~/components/AccountCard';
import { Account, Fraction } from '~/utils/types';
import { validateAmount } from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import { getGTUSymbol } from '~/utils/gtu';
import ErrorMessage from '~/components/Form/ErrorMessage';
import { useAccountInfo } from '~/utils/hooks';
import GtuInput from '~/components/Form/GtuInput';

import styles from './PickAmount.module.scss';

interface Props {
    account: Account | undefined;
    estimatedFee?: Fraction;
    amount: string | undefined;
    setAmount: (amount: string | undefined) => void;
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
}: Props): JSX.Element {
    if (!account) {
        throw new Error('Unexpected missing account');
    }

    const accountInfo = useAccountInfo(account.address);
    const [error, setError] = useState<string>();
    const [state, setState] = useState<string | undefined>(amount);

    const onChange = useCallback(
        (newState: string) => {
            setState(newState);
            const validation = validateAmount(
                newState,
                accountInfo,
                estimatedFee && collapseFraction(estimatedFee)
            );
            setError(validation);
            setAmount(validation === undefined ? newState : undefined);
        },
        [accountInfo, estimatedFee, setAmount]
    );

    return (
        <div className="flexColumn">
            <AccountCard account={account} accountInfo={accountInfo} />
            <h5 className="mB0">Amount:</h5>
            <div className={clsx(styles.inputWrapper)}>
                {getGTUSymbol()}{' '}
                <GtuInput
                    value={state}
                    onChange={onChange}
                    isInvalid={Boolean(error)}
                />
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
