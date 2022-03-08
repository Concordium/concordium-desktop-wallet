import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { TimeParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import { getCurrentValue, getPaydaysPerYear } from './util';
import MintRateInput from './MintRateInput';
import Label from '~/components/Label';

interface Props extends ChainData {
    timeParameters: TimeParameters;
}

/**
 * Displays an overview of a mint distribution transaction payload.
 */
export default withChainData(function TimeParametersView({
    timeParameters,
    blockSummary,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !blockSummary) {
        return <Loading />;
    }
    if (!isBlockSummaryV1(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const {
        mintPerPayday: currentMintRate,
        rewardPeriodLength: currentRewardPeriodLength,
    } = getCurrentValue(blockSummary);

    const {
        mintRatePerPayday: newMintRate,
        rewardPeriodLength: newRewardPeriodLength,
    } = timeParameters;

    return (
        <>
            <div>
                <Label className="mB5">Current time parameters:</Label>
                <MintRateInput
                    value={currentMintRate.toString()}
                    slotsPerYear={getPaydaysPerYear(
                        currentRewardPeriodLength,
                        consensusStatus
                    )}
                    disabled
                    className="mB20"
                />
                <Label className="mB5">Current reward period length:</Label>
                {currentRewardPeriodLength}
            </div>
            <div>
                <Label className="mB5">New time parameters:</Label>
                <MintRateInput
                    value={newMintRate.toString()}
                    slotsPerYear={getPaydaysPerYear(
                        newRewardPeriodLength,
                        consensusStatus
                    )}
                    disabled
                    className="mB20"
                />
                <Label className="mB5">New reward period length:</Label>
                {newRewardPeriodLength} milliseconds
            </div>
        </>
    );
});
