import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { MintDistribution, MintRate, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/UpdateInstructionHelper';

/**
 * Component for creating an update mint distribution transaction.
 */
export default function UpdateMintDistribution({
    blockSummary,
    forwardTransaction,
}: UpdateProps): JSX.Element | null {
    const [
        mintDistribution,
        setMintDistribution,
    ] = useState<MintDistribution>();

    const sequenceNumber =
        blockSummary.updates.updateQueues.mintDistribution.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.mintDistribution;
    const currentMintDistribution =
        blockSummary.updates.chainParameters.rewardParameters.mintDistribution;

    if (!mintDistribution) {
        const mintRate: MintRate = {
            mantissa: 1,
            exponent: 5,
        };
        setMintDistribution({
            bakingReward: currentMintDistribution.bakingReward,
            finalizationReward: currentMintDistribution.finalizationReward,
            mintPerSlot: mintRate,
        });
        return null;
    }

    return (
        <>
            Hello!
            <Button
                primary
                onClick={() =>
                    forwardTransaction(
                        createUpdateMultiSignatureTransaction(
                            mintDistribution,
                            UpdateType.UpdateMintDistribution,
                            sequenceNumber,
                            threshold
                        )
                    )
                }
            >
                Generate transaction proposal
            </Button>
        </>
    );
}
