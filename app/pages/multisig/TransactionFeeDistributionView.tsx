import React from 'react';
import { Progress } from 'semantic-ui-react';
import { ColorType, TransactionFeeDistribution } from '../../utils/types';
import { rewardFractionResolution } from '../../constants/updateConstants.json';

interface Props {
    transactionFeeDistribution: TransactionFeeDistribution;
}

/**
 * Displays an overview of a transaction fee distribution transaction payload.
 */
export default function TransactionFeeDistributionView({
    transactionFeeDistribution,
}: Props) {
    const foundationShare =
        rewardFractionResolution -
        (transactionFeeDistribution.baker +
            transactionFeeDistribution.gasAccount);

    return (
        <>
            <Progress
                value={transactionFeeDistribution.baker}
                total={rewardFractionResolution}
                progress="percent"
                label="Baker reward"
                color={ColorType.Blue}
            />
            <Progress
                value={transactionFeeDistribution.gasAccount}
                total={rewardFractionResolution}
                progress="percent"
                label="GAS account share"
                color={ColorType.Teal}
            />
            <Progress
                value={foundationShare}
                total={rewardFractionResolution}
                progress="percent"
                label="Foundation share"
                color={ColorType.Grey}
            />
        </>
    );
}
