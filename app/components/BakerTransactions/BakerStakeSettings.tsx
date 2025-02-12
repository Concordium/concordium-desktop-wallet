import React from 'react';
import clsx from 'clsx';
import { isBakerAccount } from '@concordium/web-sdk';
import { useAccountInfo } from '~/utils/dataHooks';
import { Account, ClassName, EqualRecord, Fraction } from '~/utils/types';
import AccountCard from '../AccountCard';
import PickBakerStakeAmount from '../PickBakerStakeAmount';
import PickBakerRestake from '../PickBakerRestake';
import Form from '../Form';
import { StakeSettings } from '~/utils/transactionFlows/configureBaker';
import StakePendingChange from '../StakePendingChange';

const fieldNames: EqualRecord<StakeSettings> = {
    stake: 'stake',
    restake: 'restake',
};

interface Props extends ClassName {
    initialData?: Partial<StakeSettings>;
    showAccountCard?: boolean;
    account: Account;
    existingValues?: StakeSettings;
    estimatedFee: Fraction;
    minimumStake: bigint;
    buttonClassName?: string;
    onSubmit(values: StakeSettings): void;
}

export default function BakerStakeSettings({
    initialData,
    showAccountCard,
    account,
    estimatedFee,
    existingValues,
    minimumStake,
    className,
    buttonClassName,
    onSubmit,
}: Props) {
    const accountInfo = useAccountInfo(account.address);
    const pendingChange =
        accountInfo !== undefined && isBakerAccount(accountInfo)
            ? accountInfo?.accountBaker.pendingChange
            : undefined;

    return (
        <Form<StakeSettings>
            onSubmit={onSubmit}
            className={clsx('flexColumn flexChildFill', className)}
        >
            <div className="flexChildFill">
                {existingValues !== undefined || (
                    <p className="mT0">
                        To register as a validator, you must choose an amount to
                        stake on the account. The staked amount will be part of
                        the balance, but while staked the amount is unavailable
                        for transactions.
                    </p>
                )}
                {existingValues !== undefined &&
                    pendingChange === undefined && (
                        <p className="mT0">
                            Enter your new desired amount to stake. If you
                            increase the stake it will take effect at the next
                            pay day, and if you decrease the stake it will take
                            effect at the first pay day after a cooldown period.
                        </p>
                    )}
                {pendingChange !== undefined && (
                    <div className="mV10 body2">
                        Cannot update validator stake at this time:
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
                <PickBakerStakeAmount
                    header="Amount:"
                    initial={initialData?.stake}
                    accountInfo={accountInfo}
                    estimatedFee={estimatedFee}
                    fieldName={fieldNames.stake}
                    minimumStake={minimumStake}
                    existing={existingValues?.stake}
                    hasPendingChange={pendingChange !== undefined}
                />
                <p className="mB30">
                    By default all validator rewards are added to the staked
                    amount. This can be disabled below.
                </p>
                <PickBakerRestake
                    initial={initialData?.restake}
                    fieldName={fieldNames.restake}
                    existing={existingValues?.restake}
                />
            </div>
            <Form.Submit className={clsx('mT50', buttonClassName)}>
                Continue
            </Form.Submit>
        </Form>
    );
}
