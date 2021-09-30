import React from 'react';
import clsx from 'clsx';
import { useAccountInfo } from '~/utils/dataHooks';
import { Account, ClassName, EqualRecord, Fraction } from '~/utils/types';
import AccountCard from './AccountCard';
import PickBakerStakeAmount from './PickBakerStakeAmount';
import PickBakerRestake from './PickBakerRestake';
import Form from './Form';

export interface AddBakerForm {
    stake: string;
    restake: boolean;
}

const fieldNames: EqualRecord<AddBakerForm> = {
    stake: 'stake',
    restake: 'restake',
};

interface Props extends ClassName {
    showAccountCard?: boolean;
    account: Account;
    estimatedFee: Fraction;
    minimumStake: bigint;
    onSubmit(values: AddBakerForm): void;
}

export default function AddBakerDetailsForm({
    showAccountCard,
    account,
    estimatedFee,
    minimumStake,
    className,
    onSubmit,
}: Props) {
    const accountInfo = useAccountInfo(account.address);

    return (
        <Form<AddBakerForm>
            onSubmit={onSubmit}
            className={clsx('flexColumn', className)}
        >
            <div>
                <p className="mT0">
                    To add a baker you must choose an amount to stake on the
                    account. The staked amount will be part of the balance, but
                    while staked the amount is unavailable for transactions.
                </p>
                {showAccountCard && (
                    <AccountCard account={account} accountInfo={accountInfo} />
                )}
                <PickBakerStakeAmount
                    accountInfo={accountInfo}
                    estimatedFee={estimatedFee}
                    fieldName={fieldNames.stake}
                    minimumStake={minimumStake}
                />
                <p>
                    By default all baker rewards are added to the staked amount.
                    This can be disabled below.
                </p>
                <PickBakerRestake fieldName={fieldNames.restake} />
            </div>
            <Form.Submit className="mT40">Continue</Form.Submit>
        </Form>
    );
}
