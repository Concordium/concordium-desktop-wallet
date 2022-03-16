import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { CooldownParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Input from '~/components/Form/Input';
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
                <Input
                    className="body2 mB20"
                    value={currentPoolOwnerCooldown.toString()}
                    label={`Current ${fieldDisplays.poolOwnerCooldown} (seconds)`}
                    disabled
                />
                <Input
                    className="body2"
                    value={currentDelegatorCooldown.toString()}
                    label={`Current ${fieldDisplays.delegatorCooldown} (seconds)`}
                    disabled
                />
            </div>
            <div>
                <Input
                    className="body2 mB20"
                    value={newPoolOwnerCooldown.toString()}
                    label={`New ${fieldDisplays.poolOwnerCooldown} (seconds)`}
                    disabled
                />
                <Input
                    className="body2"
                    value={newDelegatorCooldown.toString()}
                    label={`New ${fieldDisplays.delegatorCooldown} (seconds)`}
                    disabled
                />
            </div>
        </>
    );
});
