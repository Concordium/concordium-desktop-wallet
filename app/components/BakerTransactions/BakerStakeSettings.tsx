import React from 'react';
import clsx from 'clsx';
import {
    useAccountInfo,
    useCalcBakerStakeCooldownUntil,
} from '~/utils/dataHooks';
import { Account, ClassName, EqualRecord, Fraction } from '~/utils/types';
import AccountCard from '../AccountCard';
import PickBakerStakeAmount from '../PickBakerStakeAmount';
import PickBakerRestake from '../PickBakerRestake';
import Form from '../Form';
import { StakeSettings } from '~/utils/transactionFlows/configureBaker';
import { getFormattedDateString } from '~/utils/timeHelpers';
import BakerPendingChange from '../BakerPendingChange';

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
    showCooldown?: boolean;
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
    showCooldown = false,
}: Props) {
    const accountInfo = useAccountInfo(account.address);
    const { pendingChange } = accountInfo?.accountBaker ?? {};
    const cooldownUntil = useCalcBakerStakeCooldownUntil();

    return (
        <Form<StakeSettings>
            onSubmit={onSubmit}
            className={clsx('flexColumn flexChildFill', className)}
        >
            <div className="flexChildFill">
                {showCooldown || (
                    <p className="mT0">
                        To add a baker you must choose an amount to stake on the
                        account. The staked amount will be part of the balance,
                        but while staked the amount is unavailable for
                        transactions.
                    </p>
                )}
                {showCooldown && pendingChange === undefined && (
                    <p className="mT0">
                        Enter your new desired amount to stake. If you raise the
                        stake it will take effect after two epochs, and if you
                        lower the stake it will take effect after the grace
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
                {pendingChange !== undefined && (
                    <div className="mV10">
                        Cannot update baker stake at this time:
                        <div className="bodyEmphasized textError mV10">
                            <BakerPendingChange pending={pendingChange} />
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
                />
                <p className="mB30">
                    By default all baker rewards are added to the staked amount.
                    This can be disabled below.
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
