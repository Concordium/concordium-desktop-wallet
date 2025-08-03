import React from 'react';
import { isChainParametersV0 } from '@concordium/web-sdk';
import { TimeParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import { getPaydaysPerYear } from './util';
import MintRateInput from '../common/MintRateInput';
import Label from '~/components/Label';
import { stringifyMintRate } from '~/utils/mintDistributionHelpers';

interface Props extends ChainData {
    timeParameters: TimeParameters;
}

/**
 * Displays an overview of an update time parameters transaction transaction transaction payload.
 */
export default withChainData(function TimeParametersView({
    timeParameters,
    chainParameters,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !chainParameters) {
        return <Loading inline />;
    }
    if (isChainParametersV0(chainParameters)) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const {
        mintPerPayday: currentMintRate,
        rewardPeriodLength: currentRewardPeriodLength,
    } = chainParameters;

    const {
        mintRatePerPayday: newMintRate,
        rewardPeriodLength: newRewardPeriodLength,
    } = timeParameters;

    return (
        <>
            <div>
                <Label className="mB5">Current mint rate:</Label>
                <MintRateInput
                    value={currentMintRate.toString()}
                    paydaysPerYear={getPaydaysPerYear(
                        currentRewardPeriodLength,
                        consensusStatus
                    )}
                    disabled
                    className="mB20 mono"
                />
                <Label className="mB5">Current reward period length:</Label>
                <div className="mono">
                    {currentRewardPeriodLength.toString()} epochs
                </div>
            </div>
            <div>
                <Label className="mB5">Current mint rate:</Label>
                <MintRateInput
                    value={stringifyMintRate(newMintRate)}
                    paydaysPerYear={getPaydaysPerYear(
                        BigInt(newRewardPeriodLength),
                        consensusStatus
                    )}
                    disabled
                    className="mB20 mono"
                />
                <Label className="mB5">New reward period length:</Label>
                <div className="mono">
                    {newRewardPeriodLength.toString()} epochs
                </div>
            </div>
        </>
    );
});
