import React, { useCallback, useMemo } from 'react';
import { useForm, useFormContext, Validate } from 'react-hook-form';
import { Redirect } from 'react-router';
import clsx from 'clsx';
import { isDelegatorAccount } from '@concordium/web-sdk';
import AccountCard from '~/components/AccountCard';
import Form from '~/components/Form';
import ErrorMessage from '~/components/Form/ErrorMessage';
import Label from '~/components/Label';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { collapseFraction, noOp } from '~/utils/basicHelpers';
import {
    useCalcDelegatorCooldownUntil,
    useStakeIncreaseUntil,
} from '~/utils/dataHooks';
import { useAsyncMemo, useUpdateEffect } from '~/utils/hooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import {
    ConfigureDelegationFlowState,
    DelegateSettings,
    getDelegationFlowChanges,
    getEstimatedConfigureDelegationFee,
    getExistingDelegationValues,
} from '~/utils/transactionFlows/configureDelegation';
import { validateDelegateAmount } from '~/utils/transactionHelpers';
import { Account, AccountInfo, EqualRecord, Fraction } from '~/utils/types';
import StakePendingChange from '~/components/StakePendingChange';
import Loading from '~/cross-app-components/Loading';
import { getPoolStatusLatest } from '~/node/nodeHelpers';
import { displayAsCcd, getCcdSymbol } from '~/utils/ccd';
import SidedRow from '~/components/SidedRow';

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
    const increaseEffectiveTime = useStakeIncreaseUntil();
    const cooldownUntil = useCalcDelegatorCooldownUntil();
    const form = useFormContext<SubState>();
    const { errors } = form;
    const amount = form.watch(fieldNames.amount);

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
                    Current stake: {getCcdSymbol()}
                    {existing}
                </div>
            )}
            <Label>Amount</Label>
            <div className="h1 mV5">
                <span
                    className={clsx(
                        hasPendingChange ? 'textFaded' : 'textBlue'
                    )}
                >
                    {getCcdSymbol()}
                </span>
                <Form.CcdInput
                    name={fieldNames.amount}
                    disabled={hasPendingChange}
                    autoFocus
                    rules={{
                        required: 'Please specify amount to delegate',
                        validate: validDelegateAmount,
                    }}
                />
            </div>
            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
            {existing !== undefined &&
                form.formState.isValid &&
                cooldownUntil &&
                amount < existing && (
                    <div className="textFaded">
                        Will take effect at
                        <span className="block bodyEmphasized mT5">
                            {getFormattedDateString(cooldownUntil)}
                        </span>
                    </div>
                )}
            {existing !== undefined &&
                form.formState.isValid &&
                increaseEffectiveTime &&
                amount > existing && (
                    <div className="textFaded">
                        Will take effect at
                        <span className="block bodyEmphasized mT5">
                            {getFormattedDateString(increaseEffectiveTime)}
                        </span>
                    </div>
                )}
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
    const poolInfo = useAsyncMemo(
        () =>
            target != null
                ? getPoolStatusLatest(BigInt(target))
                : Promise.resolve(undefined),
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
        ...existing?.delegate,
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

    if (target && poolInfo === undefined) {
        return <Loading inline text="Loading delegation target data" />;
    }

    return (
        <Form<SubState>
            className={styles.root}
            onSubmit={onNext}
            formMethods={form}
        >
            <div className="flexChildFill">
                {existing !== undefined || (
                    <p className="mT0">
                        This transaction will{' '}
                        {target != null
                            ? `delegate an amount of CCD to staking pool ${target}`
                            : 'stake an amount of CCD using passive delegation'}
                        . You must choose the amount.
                    </p>
                )}
                {existing !== undefined && pendingChange === undefined && (
                    <p className="mT0">
                        Enter your new desired amount to stake. If you increase
                        the stake it will take effect at the next pay day, and
                        if you decrease the stake it will take effect at the
                        first pay day after a cool-down period.
                    </p>
                )}
                {pendingChange !== undefined && (
                    <div className="mB10 body2">
                        Cannot update delegated amount at this time:
                        <div className="bodyEmphasized textError mV10">
                            <StakePendingChange pending={pendingChange} />
                        </div>
                        It will be possible to proceed after this time has
                        passed.
                    </div>
                )}
                {poolInfo && (
                    <div className="body2 mV30">
                        <Label className="mB5">Target pool status</Label>
                        <SidedRow
                            left="Current pool:"
                            right={`${displayAsCcd(poolInfo.delegatedCapital)}`}
                        />
                        <SidedRow
                            className="mT5"
                            left="Pool limit:"
                            right={`${displayAsCcd(
                                poolInfo.delegatedCapitalCap
                            )}`}
                        />
                    </div>
                )}
                {showAccountCard && (
                    <AccountCard account={account} accountInfo={accountInfo} />
                )}
                <PickDelegateAmount
                    accountInfo={accountInfo}
                    existing={existing?.delegate?.amount}
                    estimatedFee={estimatedFee}
                    max={poolInfo ? poolInfo.delegatedCapitalCap : undefined}
                    hasPendingChange={pendingChange !== undefined}
                />
                <p className="mB30">
                    By default all delegation rewards are added to the delegated
                    amount. This can be disabled below.
                </p>
                {existing !== undefined && (
                    <div className="body3 mono mB10">
                        Current option:{' '}
                        {existing.delegate.redelegate
                            ? 'Redelegate'
                            : "Don't redelegate"}
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
