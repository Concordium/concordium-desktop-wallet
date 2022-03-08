import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { CooldownParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';

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
        return <Loading />;
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
                <Label className="mB5">Current pool owner cooldown:</Label>
                {currentPoolOwnerCooldown} seconds
                <Label className="mB5">Current delegator cooldown:</Label>
                {currentDelegatorCooldown} seconds
            </div>
            <div>
                <Label className="mB5">New pool owner cooldown:</Label>
                {newPoolOwnerCooldown} seconds
                <Label className="mB5">New delegator cooldown:</Label>
                {newDelegatorCooldown} seconds
            </div>
        </>
    );
});
