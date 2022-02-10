import React, { useCallback } from 'react';
import { useForm, useFormContext, Validate } from 'react-hook-form';
import { Redirect } from 'react-router';
import AccountCard from '~/components/AccountCard';
import Form from '~/components/Form';
import ErrorMessage from '~/components/Form/ErrorMessage';
import Label from '~/components/Label';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { collapseFraction } from '~/utils/basicHelpers';
import { useCalcDelegateAmountCooldownUntil } from '~/utils/dataHooks';
import { getGTUSymbol } from '~/utils/gtu';
import { useUpdateEffect } from '~/utils/hooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import {
    ConfigureDelegationFlowState,
    DelegateSettings,
    displayRedelegate,
    getDelegationFlowChanges,
    getEstimatedConfigureDelegationFee,
    getExistingDelegationValues,
} from '~/utils/transactionFlows/configureDelegation';
import { validateDelegateAmount } from '~/utils/transactionHelpers';
import { Account, AccountInfo, EqualRecord, Fraction } from '~/utils/types';

import styles from './DelegationPage.module.scss';

type SubState = DelegateSettings;

const fieldNames: EqualRecord<SubState> = {
    amount: 'amount',
    redelegate: 'redelegate',
};

interface PickDelegateAmountProps {
    accountInfo: AccountInfo;
    existing?: string;
    estimatedFee: Fraction;
    max: bigint;
}

function PickDelegateAmount({
    accountInfo,
    estimatedFee,
    existing,
    max,
}: PickDelegateAmountProps) {
    const form = useFormContext<SubState>();
    const { errors } = form;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const validDelegateAmount: Validate = useCallback(
        validateDelegateAmount(
            max,
            accountInfo,
            collapseFraction(estimatedFee)
        ),
        [accountInfo, estimatedFee, max]
    );

    useUpdateEffect(() => {
        if (!form || !form.formState.dirtyFields.amount) {
            return;
        }

        form.trigger(fieldNames.amount);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validDelegateAmount]);

    return (
        <div className="mV30">
            {existing && (
                <div className="body3 mono mB10">
                    Current stake: {getGTUSymbol()}
                    {existing}
                </div>
            )}
            <Label>Amount</Label>
            <div className="h1 mV5">
                {getGTUSymbol()}
                <Form.GtuInput
                    name={fieldNames.amount}
                    autoFocus
                    rules={{
                        required: 'Please specify amount to delegate',
                        min: { value: 0, message: 'Value cannot be negative' },
                        validate: validDelegateAmount,
                    }}
                />
            </div>
            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
        </div>
    );
}

interface Props
    extends MultiStepFormPageProps<SubState, ConfigureDelegationFlowState> {
    /**
     * Max delegation amount for delegation target in micro CCD
     */
    maxDelegationAmount: bigint;
    account: Account;
    accountInfo: AccountInfo;
    showAccountCard?: boolean;
    exchangeRate: Fraction;
    baseRoute: string;
}

export default function DelegationAmountPage({
    onNext,
    initial,
    formValues: { target },
    maxDelegationAmount,
    account,
    accountInfo,
    showAccountCard = false,
    exchangeRate,
    baseRoute,
}: Props) {
    const cooldownUntil = useCalcDelegateAmountCooldownUntil();
    const existing = getExistingDelegationValues(accountInfo);
    const defaultValues: SubState = {
        amount: '0.00',
        redelegate: true,
        ...existing,
        ...initial,
    };
    const form = useForm<SubState>({
        mode: 'onTouched',
        defaultValues,
    });

    if (target === undefined) {
        return <Redirect to={baseRoute} />;
    }

    const values = form.watch();
    const allValues: ConfigureDelegationFlowState = {
        target,
        delegate: values,
    };
    const changes =
        existing !== undefined
            ? getDelegationFlowChanges(existing, allValues)
            : allValues;
    const estimatedFee = getEstimatedConfigureDelegationFee(
        changes,
        exchangeRate,
        account.signatureThreshold
    );

    return (
        <Form<SubState>
            className={styles.root}
            onSubmit={onNext}
            formMethods={form}
        >
            <div className="flexChildFill">
                {existing || (
                    <p className="mT0">
                        This transaction will delegate an amount of CCD to an
                        active baker. You must choose the amount to delegate, if
                        you want to add rewards to the delegated amount.
                    </p>
                )}
                {existing && (
                    <p className="mT0">
                        Enter your new desired amount to delegate. If you raise
                        the stake it will take effect after two epochs, and if
                        you lower the stake it will take effect after the grace
                        period.
                        {cooldownUntil && (
                            <>
                                <br />
                                <br />
                                This grace period will last until
                                <span className="block bodyEmphasized  mV10">
                                    {getFormattedDateString(cooldownUntil)}
                                </span>
                            </>
                        )}
                    </p>
                )}
                {showAccountCard && (
                    <AccountCard account={account} accountInfo={accountInfo} />
                )}
                <p>target: {target ?? 'L-pool'}</p>
                <PickDelegateAmount
                    accountInfo={accountInfo}
                    existing={existing?.delegate?.amount}
                    estimatedFee={estimatedFee}
                    max={maxDelegationAmount}
                />
                <p className="mB30">
                    By default all delegation rewards are added to the delegated
                    amount. This can be disabled below.
                </p>
                {existing !== undefined && (
                    <div className="body3 mono mB10">
                        Current option:{' '}
                        {displayRedelegate(existing.delegate.redelegate)}
                    </div>
                )}
                <Form.Radios
                    name={fieldNames.redelegate}
                    options={[
                        {
                            label: 'Redelegate',
                            value: true,
                        },
                        {
                            label: "Don't redelegate",
                            value: false,
                        },
                    ]}
                />
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
