import React from 'react';
import { Progress } from 'semantic-ui-react';
import { ColorType, TransactionFeeDistribution } from '../../utils/types';

interface Props {
    transactionFeeDistribution: TransactionFeeDistribution;
}

const hundredThousand = 100000;

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default function TransactionFeeDistributionView({
    transactionFeeDistribution,
}: Props) {
    const foundationShare =
        hundredThousand -
        (transactionFeeDistribution.baker +
            transactionFeeDistribution.gasAccount);

    return (
        <>
            <Progress
                value={transactionFeeDistribution.baker}
                total={hundredThousand}
                progress="percent"
                label="New baker reward"
                color={ColorType.Blue}
            />
            <Progress
                value={transactionFeeDistribution.gasAccount}
                total={hundredThousand}
                progress="percent"
                label="New GAS account share"
                color={ColorType.Teal}
            />
            <Progress
                value={foundationShare}
                total={hundredThousand}
                progress="percent"
                label="New foundation share"
                color={ColorType.Grey}
            />
        </>
    );
}
