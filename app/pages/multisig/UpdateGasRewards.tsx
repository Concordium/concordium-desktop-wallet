import React, { useState } from 'react';
import {
    Button,
    Divider,
    Header,
    Input,
    Label,
    List,
    Progress,
} from 'semantic-ui-react';
import { rewardFractionResolution } from '../../constants/updateConstants.json';
import {
    ColorType,
    GasRewards,
    RewardFraction,
    UpdateType,
} from '../../utils/types';
import { UpdateProps } from '../../utils/transactionTypes';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';

// TODO Update the UI when the sketches are complete.
// TODO Do input validation.

/**
 * Update the state using the received set state function with the input received, which
 * is assumed to be an integer.
 */
function updateState(
    setStateFunction: React.Dispatch<React.SetStateAction<number | undefined>>,
    input: string
) {
    const value = parseInt(input, 10);
    if (!Number.isNaN(value)) {
        setStateFunction(value);
    }
}

/**
 * The component used for creating an update transaction for updating the
 * GAS rewards chain parameters.
 */
export default function UpdateGasRewards({
    blockSummary,
    forwardTransaction,
}: UpdateProps) {
    const [bakerReward, setBakerReward] = useState<RewardFraction>();
    const [
        finalizationProofReward,
        setFinalizationProofReward,
    ] = useState<RewardFraction>();
    const [
        accountCreationReward,
        setAccountCreationReward,
    ] = useState<RewardFraction>();
    const [
        chainUpdateReward,
        setChainUpdateReward,
    ] = useState<RewardFraction>();

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

    if (
        !bakerReward ||
        !finalizationProofReward ||
        !accountCreationReward ||
        !chainUpdateReward
    ) {
        setBakerReward(currentBakerReward);
        setFinalizationProofReward(currentFinalizationProofFraction);
        setAccountCreationReward(currentAccountCreationFraction);
        setChainUpdateReward(currentChainUpdateFraction);
        return null;
    }

    const gasRewards: GasRewards = {
        baker: bakerReward,
        accountCreation: accountCreationReward,
        chainUpdate: chainUpdateReward,
        finalizationProof: finalizationProofReward,
    };

    const button = (
        <Button
            primary
            onClick={() =>
                forwardTransaction(
                    createUpdateMultiSignatureTransaction(
                        gasRewards,
                        UpdateType.UpdateGASRewards,
                        sequenceNumber,
                        threshold
                    )
                )
            }
        >
            Generate transaction
        </Button>
    );

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
                        value={bakerReward}
                        onChange={(e) =>
                            updateState(setBakerReward, e.target.value)
                        }
                        fluid
                    />
                </List.Item>
                <List.Item>
                    <Input
                        label="Finalization proof reward"
                        value={finalizationProofReward}
                        onChange={(e) =>
                            updateState(
                                setFinalizationProofReward,
                                e.target.value
                            )
                        }
                        fluid
                    />
                </List.Item>
                <List.Item>
                    <Input
                        label="Account creation reward"
                        value={accountCreationReward}
                        onChange={(e) =>
                            updateState(
                                setAccountCreationReward,
                                e.target.value
                            )
                        }
                        fluid
                    />
                </List.Item>
                <List.Item>
                    <Input
                        label="Chain update reward"
                        value={chainUpdateReward}
                        onChange={(e) =>
                            updateState(setChainUpdateReward, e.target.value)
                        }
                        fluid
                    />
                </List.Item>
            </List>
            <Divider clearing hidden />
            {button}
        </>
    );
}
