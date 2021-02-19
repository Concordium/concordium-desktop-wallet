import React from 'react';
import { Header, Label, Progress } from 'semantic-ui-react';
import { ColorType, GasRewards } from '../../utils/types';
import { rewardFractionResolution } from '../../constants/updateConstants.json';

// TODO Make the UI better when drawings are available, and non-semantic UI
// components are ready.

interface Props {
    gasRewards: GasRewards;
}

/**
 * Displays an overview of a gas rewards transaction payload.
 */
export default function GasRewardsView({ gasRewards }: Props) {
    return (
        <>
            <Progress
                value={gasRewards.baker}
                total={rewardFractionResolution}
                progress="percent"
                label="New baker reward"
                color={ColorType.Pink}
            />
            <Header>N = 1 - (1 - F)^f · (1 - A)^a · (1 - U)^u</Header>
            The bakers fractions of the GAS account will be:
            <Header>{gasRewards.baker / 1000}% + 75% · N</Header>
            <Label color={ColorType.Purple}>
                F = {gasRewards.finalizationProof / 1000}%
            </Label>
            <Label color={ColorType.Black}>
                A = {gasRewards.accountCreation / 1000}%
            </Label>
            <Label color={ColorType.Green}>
                U = {gasRewards.chainUpdate / 1000}%
            </Label>
        </>
    );
}
