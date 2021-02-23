import React, { useState } from 'react';
import { Button, Form, Grid, Input, Progress } from 'semantic-ui-react';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import {
    ColorType,
    TransactionFeeDistribution,
    UpdateType,
} from '../../utils/types';
import { rewardFractionResolution } from '../../constants/updateConstants.json';
import { UpdateProps } from '../../utils/transactionTypes';

export default function UpdateTransactionFeeDistribution({
    blockSummary,
    forwardTransaction,
}: UpdateProps) {
    const [
        transactionFeeDistribution,
        setTransactionFeeDistribution,
    ] = useState<TransactionFeeDistribution>();

    const sequenceNumber =
        blockSummary.updates.updateQueues.transactionFeeDistribution
            .nextSequenceNumber;
    const {
        threshold,
    } = blockSummary.updates.authorizations.transactionFeeDistribution;

    const currentBakerFee =
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.baker * rewardFractionResolution;
    const currentGasAccountFee =
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.gasAccount * rewardFractionResolution;
    const foundationShare =
        rewardFractionResolution - (currentBakerFee + currentGasAccountFee);

    let newFoundationShare;
    if (transactionFeeDistribution) {
        newFoundationShare =
            rewardFractionResolution -
            (transactionFeeDistribution?.baker +
                transactionFeeDistribution?.gasAccount);
    }

    function updateTransactionFee(
        inputValue: string,
        property: keyof TransactionFeeDistribution,
        distribution: TransactionFeeDistribution
    ) {
        if (inputValue) {
            let value;
            try {
                value = parseInt(inputValue, 10);
            } catch (error) {
                // Input not a valid integer. Do nothing.
                return;
            }

            const updatedTransactionFeeDistribution = {
                ...distribution,
            };
            updatedTransactionFeeDistribution[property] = value;
            setTransactionFeeDistribution(updatedTransactionFeeDistribution);
        }
    }

    if (!transactionFeeDistribution) {
        setTransactionFeeDistribution({
            baker: currentBakerFee,
            gasAccount: currentGasAccountFee,
        });
        return null;
    }

    const generateTransactionButton = (
        <Button
            primary
            disabled={
                transactionFeeDistribution.baker +
                    transactionFeeDistribution.gasAccount >
                rewardFractionResolution
            }
            onClick={() =>
                forwardTransaction(
                    createUpdateMultiSignatureTransaction(
                        transactionFeeDistribution,
                        UpdateType.UpdateTransactionFeeDistribution,
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
            <Grid columns={2}>
                <Grid.Column>
                    <Progress
                        value={currentBakerFee}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="Current baker reward"
                        color={ColorType.Blue}
                    />
                    <Progress
                        value={currentGasAccountFee}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="Current GAS account share"
                        color={ColorType.Teal}
                    />
                    <Progress
                        value={foundationShare}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="Current foundation share"
                        color={ColorType.Grey}
                    />
                </Grid.Column>
                <Grid.Column>
                    <Progress
                        value={transactionFeeDistribution.baker}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="New baker reward"
                        color={ColorType.Blue}
                    />
                    <Progress
                        value={transactionFeeDistribution.gasAccount}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="New GAS account share"
                        color={ColorType.Teal}
                    />
                    <Progress
                        value={newFoundationShare}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="New foundation share"
                        color={ColorType.Grey}
                    />
                    <Form>
                        <Form.Group widths="equal">
                            <Form.Field
                                label="New baker reward (/100000)"
                                control={Input}
                                value={transactionFeeDistribution.baker.toString()}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    updateTransactionFee(
                                        e.target.value,
                                        'baker',
                                        transactionFeeDistribution
                                    );
                                }}
                            />
                            <Form.Field
                                label="New gas account share (/100000)"
                                control={Input}
                                value={transactionFeeDistribution.gasAccount.toString()}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    updateTransactionFee(
                                        e.target.value,
                                        'gasAccount',
                                        transactionFeeDistribution
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
