import React from 'react';
import { isChainParametersV0 } from '@concordium/web-sdk';
import { CooldownParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { fieldDisplays } from './UpdateCooldownParameters';

interface Props extends ChainData {
    cooldownParameters: CooldownParameters;
}

/**
 * Displays an overview of an update cooldown parameter transaction payload.
 */
export default withChainData(function CooldownParametersView({
    cooldownParameters,
    chainParameters,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !chainParameters) {
        return <Loading inline />;
    }
    if (isChainParametersV0(chainParameters)) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const currentPoolOwnerCooldown = chainParameters.poolOwnerCooldown;
    const currentDelegatorCooldown = chainParameters.delegatorCooldown;

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
