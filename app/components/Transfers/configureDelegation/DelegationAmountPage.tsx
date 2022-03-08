import React, { useCallback, useMemo } from 'react';
import { useForm, useFormContext, Validate } from 'react-hook-form';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import { BakerPoolStatus } from '@concordium/node-sdk';
import AccountCard from '~/components/AccountCard';
import Form from '~/components/Form';
import ErrorMessage from '~/components/Form/ErrorMessage';
import Label from '~/components/Label';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { collapseFraction, noOp } from '~/utils/basicHelpers';
import { useCalcDelegatorCooldownUntil } from '~/utils/dataHooks';
import { getGTUSymbol } from '~/utils/gtu';
import { useAsyncMemo, useUpdateEffect } from '~/utils/hooks';
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
import StakePendingChange from '~/components/StakePendingChange';
import Loading from '~/cross-app-components/Loading';
import { getPoolInfoLatest } from '~/node/nodeHelpers';

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
    max?: bigint;
    hasPendingChange: boolean;
}

function PickDelegateAmount({
    accountInfo,
    estimatedFee,
    existing,
    max,
    hasPendingChange,
}: PickDelegateAmountProps) {
    const form = useFormContext<SubState>();
    const { errors } = form;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const validDelegateAmount: Validate = useCallback(
        validateDelegateAmount(
            accountInfo,
            collapseFraction(estimatedFee),
            max
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
                <span className={clsx(hasPendingChange && 'textFaded')}>
                    {getGTUSymbol()}
                </span>
                <Form.GtuInput
                    name={fieldNames.amount}
                    disabled={hasPendingChange}
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
    account,
    accountInfo,
    showAccountCard = false,
    exchangeRate,
    baseRoute,
}: Props) {
    const cooldownUntil = useCalcDelegatorCooldownUntil();
    const poolInfo = useAsyncMemo(
        () => getPoolInfoLatest(target != null ? BigInt(target) : undefined),
        noOp,
        [target]
    );
    const existing = getExistingDelegationValues(accountInfo);

    const pendingChange =
        accountInfo !== undefined && isDelegatorAccount(accountInfo)
            ? accountInfo.accountDelegation.pendingChange
            : undefined;
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

    const values = form.watch();
    const allValues: ConfigureDelegationFlowState = {
        target,
        delegate: values,
    };
    const changes =
        existing !== undefined
            ? getDelegationFlowChanges(existing, allValues)
            : allValues;

    const redelgateChanged = changes.delegate?.redelegate === undefined;
    const amountChanged = changes.delegate?.amount === undefined;

    const estimatedFee = useMemo(
        () =>
            getEstimatedConfigureDelegationFee(
                changes,
                exchangeRate,
                account.signatureThreshold
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [redelgateChanged, amountChanged] // fee only changes when either of these change from being defined to undefined or vice versa.
    );

    if (target === undefined) {
        return <Redirect to={baseRoute} />;
    }

    if (poolInfo === undefined) {
        return <Loading inline text="Loading delegation target data" />;
    }

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
                {existing && pendingChange === undefined && (
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
                                <span className="block bodyEmphasized mV10">
                                    {getFormattedDateString(cooldownUntil)}
                                </span>
                            </>
                        )}
                    </p>
                )}
                {pendingChange !== undefined && (
                    <div className="mV10">
                        Cannot update delegated amount at this time:
                        <div className="bodyEmphasized textError mV10">
                            <StakePendingChange pending={pendingChange} />
                        </div>
                        It will be possible to proceed after this time has
                        passed.
                    </div>
                )}
                {showAccountCard && (
                    <AccountCard account={account} accountInfo={accountInfo} />
                )}
                <PickDelegateAmount
                    accountInfo={accountInfo}
                    existing={existing?.delegate?.amount}
                    estimatedFee={estimatedFee}
                    max={(poolInfo as BakerPoolStatus).delegatedCapitalCap}
                    hasPendingChange={pendingChange !== undefined}
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
