import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { CooldownParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { fieldDisplays } from './UpdateCooldownParameters';

interface Props extends ChainData {
    cooldownParameters: CooldownParameters;
}

/**
 * Displays an overview of a mint distribution transaction payload.
 */
export default withChainData(function CooldownParametersView({
    cooldownParameters,
    blockSummary,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !blockSummary) {
        return <Loading inline />;
    }
    if (!isBlockSummaryV1(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const currentPoolOwnerCooldown =
        blockSummary.updates.chainParameters.poolOwnerCooldown;
    const currentDelegatorCooldown =
        blockSummary.updates.chainParameters.delegatorCooldown;

    const {
        poolOwnerCooldown: newPoolOwnerCooldown,
        delegatorCooldown: newDelegatorCooldown,
    } = cooldownParameters;

    return (
        <>
            <div>
                <Label className="mB5">
                    Current {fieldDisplays.poolOwnerCooldown}:
                </Label>
                <div className="body3 mono mB20">
                    {currentPoolOwnerCooldown.toString()} seconds
                </div>
                <Label className="mB5">
                    Current {fieldDisplays.delegatorCooldown}:
                </Label>
                <div className="body3 mono">
                    {currentDelegatorCooldown.toString()} seconds
                </div>
            </div>
            <div>
                <Label className="mB5">
                    New {fieldDisplays.poolOwnerCooldown}:
                </Label>
                <div className="body3 mono mB20">
                    {newPoolOwnerCooldown.toString()} seconds
                </div>
                <Label className="mB5">
                    New {fieldDisplays.delegatorCooldown}:
                </Label>
                <div className="body3 mono">
                    {newDelegatorCooldown.toString()} seconds
                </div>
            </div>
        </>
    );
});
