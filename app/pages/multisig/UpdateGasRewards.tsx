import React, { useEffect, useState } from 'react';
import { Header, Input, Label, List, Progress } from 'semantic-ui-react';
import { rewardFractionResolution } from '../../constants/updateConstants.json';
import { ColorType, GasRewards, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/transactionTypes';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';

// TODO Update the UI when the sketches are complete.
// TODO Do input validation.

/**
 * The component used for creating an update transaction for updating the
 * GAS rewards chain parameters.
 */
export default function UpdateGasRewards({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps) {
    const [gasRewards, setGasRewards] = useState<GasRewards>();

    const sequenceNumber =
        blockSummary.updates.updateQueues.gasRewards.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.paramGASRewards;

    // The current chain parameters for GAS rewards.
    const currentBakerReward =
        blockSummary.updates.chainParameters.rewardParameters.gASRewards.baker *
        rewardFractionResolution;
    const currentFinalizationProofFraction =
        blockSummary.updates.chainParameters.rewardParameters.gASRewards
            .finalizationProof * rewardFractionResolution;
    const currentAccountCreationFraction =
        blockSummary.updates.chainParameters.rewardParameters.gASRewards
            .accountCreation * rewardFractionResolution;
    const currentChainUpdateFraction =
        blockSummary.updates.chainParameters.rewardParameters.gASRewards
            .chainUpdate * rewardFractionResolution;

    useEffect(() => {
        if (gasRewards) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    gasRewards,
                    UpdateType.UpdateGASRewards,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        }
    }, [gasRewards, sequenceNumber, threshold, setProposal, effectiveTime]);

    if (!gasRewards) {
        setGasRewards({
            baker: currentBakerReward,
            accountCreation: currentAccountCreationFraction,
            chainUpdate: currentChainUpdateFraction,
            finalizationProof: currentFinalizationProofFraction,
        });
        return null;
    }

    /**
     * Update the gas rewards state property supplied.
     */
    function updateState(
        input: string,
        property: keyof GasRewards,
        rewards: GasRewards
    ) {
        const value = parseInt(input, 10);
        if (!Number.isNaN(value)) {
            const updatedGasRewards = {
                ...rewards,
            };
            updatedGasRewards[property] = value;
            setGasRewards(updatedGasRewards);
        }
    }

    return (
        <>
            <Header>Current GAS rewards</Header>
            <Progress
                value={currentBakerReward}
                total={rewardFractionResolution}
                progress="percent"
                label="Current baker reward"
                color={ColorType.Pink}
            />
            <Header>N = 1 - (1 - F)^f · (1 - A)^a · (1 - U)^u</Header>
            The bakers fractions of the GAS account is:
            <Header>{currentBakerReward / 1000}% + 75% · N</Header>
            <Label color={ColorType.Purple}>
                F = {currentFinalizationProofFraction / 1000}%
            </Label>
            <Label color={ColorType.Black}>
                A = {currentAccountCreationFraction / 1000}%
            </Label>
            <Label color={ColorType.Green}>
                U = {currentChainUpdateFraction / 1000}%
            </Label>
            <Header>New GAS rewards</Header>
            <List>
                <List.Item>
                    <Input
                        label="Baker reward"
                        value={gasRewards.baker}
                        onChange={(e) =>
                            updateState(e.target.value, 'baker', gasRewards)
                        }
                        fluid
                    />
                </List.Item>
                <List.Item>
                    <Input
                        label="Finalization proof reward"
                        value={gasRewards.finalizationProof}
                        onChange={(e) =>
                            updateState(
                                e.target.value,
                                'finalizationProof',
                                gasRewards
                            )
                        }
                        fluid
                    />
                </List.Item>
                <List.Item>
                    <Input
                        label="Account creation reward"
                        value={gasRewards.accountCreation}
                        onChange={(e) =>
                            updateState(
                                e.target.value,
                                'accountCreation',
                                gasRewards
                            )
                        }
                        fluid
                    />
                </List.Item>
                <List.Item>
                    <Input
                        label="Chain update reward"
                        value={gasRewards.chainUpdate}
                        onChange={(e) =>
                            updateState(
                                e.target.value,
                                'chainUpdate',
                                gasRewards
                            )
                        }
                        fluid
                    />
                </List.Item>
            </List>
        </>
    );
}
