import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import AccountCard from '~/components/AccountCard';
import { Account, AccountInfo, Fraction } from '~/utils/types';
import { validateTransferAmount } from '~/utils/transactionHelpers';
import { collapseFraction, throwLoggedError } from '~/utils/basicHelpers';
import { getCcdSymbol } from '~/utils/ccd';
import ErrorMessage from '~/components/Form/ErrorMessage';
import { useAccountInfo } from '~/utils/dataHooks';
import GtuInput from '~/components/Form/GtuInput';
import Label from '~/components/Label';

import styles from './PickAmount.module.scss';

interface Props {
    account: Account | undefined;
    estimatedFee?: Fraction;
    amount: string | undefined;
    /** show an existing value above input (in CCD), to indicate a change from an existing value */
    existing?: string;
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
    existing,
    validateAmount = validateTransferAmount,
}: Props): JSX.Element {
    if (!account) {
        throwLoggedError('Unexpected missing account');
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
            <div className="mT30">
                {existing && (
                    <div className="body3 mono mB10">
                        Current stake: {getCcdSymbol()}
                        {existing}
                    </div>
                )}
                <Label className="mB5">Amount:</Label>
                <div className={clsx(styles.inputWrapper)}>
                    {getCcdSymbol()}
                    <GtuInput
                        value={state}
                        onChange={onChange}
                        isInvalid={Boolean(error)}
                        autoFocus
                    />
                </div>
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
