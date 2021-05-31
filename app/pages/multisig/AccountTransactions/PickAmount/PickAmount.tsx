import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import AccountCard from '~/components/AccountCard';
import { Account, AccountInfo, Fraction } from '~/utils/types';
import { validateTransferAmount } from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import { getGTUSymbol } from '~/utils/gtu';
import InlineNumber from '~/components/Form/InlineNumber';
import ErrorMessage from '~/components/Form/ErrorMessage';
import styles from './PickAmount.module.scss';
import { useAccountInfo } from '~/utils/dataHooks';

interface Props {
    account: Account | undefined;
    estimatedFee?: Fraction;
    amount: string | undefined;
    setAmount: (amount: string | undefined) => void;
    validateAmount?: (
        amountToValidate: string,
        accountInfo: AccountInfo | undefined,
        estimatedFee: bigint | undefined
    ) => string | undefined;
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
    validateAmount = validateTransferAmount,
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
        [accountInfo, estimatedFee, setAmount, validateAmount]
    );

    return (
        <div className="flexColumn">
            <AccountCard account={account} accountInfo={accountInfo} />
            <h5 className="mB0">Amount:</h5>
            <div className={clsx(styles.inputWrapper)}>
                {getGTUSymbol()}{' '}
                <InlineNumber
                    value={state}
                    onChange={onChange}
                    allowFractions
                    ensureDigits={2}
                    isInvalid={Boolean(error)}
                />
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
