import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import AccountCard from '~/components/AccountCard';
import { Account, AccountInfo, Fraction } from '~/utils/types';
import { validateTransferAmount } from '~/utils/transactionHelpers';
import { collapseFraction, throwLoggedError } from '~/utils/basicHelpers';
import { getCcdSymbol } from '~/utils/ccd';
import ErrorMessage from '~/components/Form/ErrorMessage';
import { useAccountInfo } from '~/utils/dataHooks';
import CcdInput from '~/components/Form/CcdInput';
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
    const [validation, setValidation] = useState<string>();
    const [state, setState] = useState<string | undefined>(amount);

    const onChange = useCallback(
        (newState: string) => {
            setState(newState);
            const newValidation = validateAmount(
                newState,
                accountInfo,
                estimatedFee && collapseFraction(estimatedFee)
            );
            setValidation(newValidation);
            setAmount(newValidation === undefined ? newState : undefined);
            if (!newValidation) {
                // if the value is valid, remove error instantly, instead of onBlur
                setError(undefined);
            }
        },
        [accountInfo, estimatedFee, setAmount, validateAmount]
    );

    const onBlur = useCallback(() => {
        // Update error displays onBlur
        setError(validation);
    }, [validation]);

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
                    <CcdInput
                        value={state}
                        onChange={onChange}
                        onBlur={onBlur}
                        isInvalid={Boolean(error)}
                        autoFocus
                    />
                </div>
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
