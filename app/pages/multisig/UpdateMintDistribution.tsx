import React, { useState } from 'react';
import {
    Button,
    Form,
    Grid,
    Header,
    Input,
    Progress,
    Segment,
} from 'semantic-ui-react';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import {
    ColorType,
    MintDistribution,
    MintRate,
    UpdateType,
} from '../../utils/types';
import { UpdateProps } from '../../utils/transactionTypes';
import { rewardFractionResolution } from '../../constants/updateConstants.json';

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

    function updateMintDistribution(
        inputValue: string,
        property: keyof Omit<MintDistribution, 'mintPerSlot'>,
        distribution: MintDistribution
    ) {
        if (inputValue) {
            let value;
            try {
                value = parseInt(inputValue, 10);
            } catch (error) {
                // Input not a valid integer. Do nothing.
                return;
            }

            const updatedMintDistribution = {
                ...distribution,
            };
            updatedMintDistribution[property] = value;
            setMintDistribution(updatedMintDistribution);
        }
    }

    if (!mintDistribution) {
        // TODO Parse the current mint distribution value instead of hardcording this value.
        const mintRate: MintRate = {
            mantissa: 7555999,
            exponent: 16,
        };
        setMintDistribution({
            bakingReward:
                currentMintDistribution.bakingReward * rewardFractionResolution,
            finalizationReward:
                currentMintDistribution.finalizationReward *
                rewardFractionResolution,
            mintPerSlot: mintRate,
        });
        return null;
    }

    const generateTransactionButton = (
        <Button
            primary
            disabled={
                mintDistribution.bakingReward +
                    mintDistribution.finalizationReward >
                rewardFractionResolution
            }
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
    );

    return (
        <>
            <Grid columns="equal">
                <Grid.Column>
                    <Segment basic textAlign="center">
                        <Header size="small">Current mint rate</Header>
                        {currentMintDistribution.mintPerSlot}
                        <Progress
                            value={
                                currentMintDistribution.bakingReward *
                                rewardFractionResolution
                            }
                            total={rewardFractionResolution}
                            progress="percent"
                            label="Current baking reward fraction"
                            color={ColorType.Blue}
                        />
                        <Progress
                            value={
                                currentMintDistribution.finalizationReward *
                                rewardFractionResolution
                            }
                            total={rewardFractionResolution}
                            progress="percent"
                            label="Current finalization reward fraction"
                            color={ColorType.Teal}
                        />
                        <Progress
                            value={
                                rewardFractionResolution -
                                (currentMintDistribution.bakingReward +
                                    currentMintDistribution.finalizationReward) *
                                    rewardFractionResolution
                            }
                            total={rewardFractionResolution}
                            progress="percent"
                            label="Current foundation reward fraction"
                            color={ColorType.Grey}
                        />
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Header size="small">New mint rate</Header>
                    <Input
                        label="Mantissa"
                        value={mintDistribution.mintPerSlot.mantissa}
                        onChange={(e) => {
                            let mintPerSlot;
                            try {
                                mintPerSlot = {
                                    ...mintDistribution.mintPerSlot,
                                    mantissa: parseInt(e.target.value, 10),
                                };
                            } catch (error) {
                                return;
                            }
                            setMintDistribution({
                                ...mintDistribution,
                                mintPerSlot,
                            });
                        }}
                    />
                    <Input
                        label="Negative exponent"
                        value={mintDistribution.mintPerSlot.exponent}
                        onChange={(e) => {
                            let mintPerSlot;
                            try {
                                mintPerSlot = {
                                    ...mintDistribution.mintPerSlot,
                                    exponent: parseInt(e.target.value, 10),
                                };
                            } catch (error) {
                                return;
                            }
                            setMintDistribution({
                                ...mintDistribution,
                                mintPerSlot,
                            });
                        }}
                    />
                    <Progress
                        value={mintDistribution.bakingReward}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="New baking reward fraction"
                        color={ColorType.Blue}
                    />
                    <Progress
                        value={mintDistribution.finalizationReward}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="New finalization reward fraction"
                        color={ColorType.Teal}
                    />
                    <Progress
                        value={
                            rewardFractionResolution -
                            (mintDistribution.bakingReward +
                                mintDistribution.finalizationReward)
                        }
                        total={rewardFractionResolution}
                        progress="percent"
                        label="New foundation reward fraction"
                        color={ColorType.Grey}
                    />
                    <Form>
                        <Form.Group widths="equal">
                            <Form.Field
                                label="New baking reward fraction (/100000)"
                                control={Input}
                                value={mintDistribution.bakingReward.toString()}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    updateMintDistribution(
                                        e.target.value,
                                        'bakingReward',
                                        mintDistribution
                                    );
                                }}
                            />
                            <Form.Field
                                label="New finalization reward fraction (/100000)"
                                control={Input}
                                value={mintDistribution.finalizationReward.toString()}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    updateMintDistribution(
                                        e.target.value,
                                        'finalizationReward',
                                        mintDistribution
                                    );
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid>
            {generateTransactionButton}
        </>
    );
}
