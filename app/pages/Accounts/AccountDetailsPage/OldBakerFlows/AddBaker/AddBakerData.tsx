import React from 'react';
import { useSelector } from 'react-redux';
import BakerStakeSettings, {
    StakeSettings,
} from '~/components/BakerTransactions/BakerStakeSettings';
import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import Card from '~/cross-app-components/Card';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { ChainData, ensureChainData } from '~/utils/withChainData';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import {
    Fraction,
    NotOptional,
    PropsOf,
    TransactionKindId,
} from '~/utils/types';

import styles from '../../AccountDetailsPage.module.scss';

type FormWrapperProps = Omit<
    PropsOf<typeof BakerStakeSettings>,
    'minimumStake' | 'estimatedFee'
> &
    NotOptional<ChainData> &
    NotOptional<ExchangeRate>;

const FormWrapper = ensureChainData(
    ({ blockSummary, exchangeRate, ...props }: FormWrapperProps) => {
        const { account } = props;
        const minimumStake = BigInt(
            blockSummary.updates.chainParameters.minimumThresholdForBaking
        );
        const estimatedFee = useTransactionCostEstimate(
            TransactionKindId.Add_baker,
            exchangeRate,
            account?.signatureThreshold
        );

        return (
            <BakerStakeSettings
                {...props}
                minimumStake={minimumStake}
                estimatedFee={estimatedFee}
                className="mT30"
                buttonClassName={styles.bakerFlowContinue}
            />
        );
    }
);

interface Props {
    header: string;
    initialData?: StakeSettings;
    exchangeRate: Fraction;
    onSubmit(values: StakeSettings): void;
}

export default function AddBakerData({
    onSubmit,
    initialData,
    header,
    exchangeRate,
}: Props) {
    const account = useSelector(chosenAccountSelector);

    if (!account) {
        throw new Error('No chosen account.');
    }

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">{header}</h3>
            <FormWrapper
                account={account}
                onSubmit={onSubmit}
                exchangeRate={exchangeRate}
                initialData={initialData}
            />
        </Card>
    );
}
