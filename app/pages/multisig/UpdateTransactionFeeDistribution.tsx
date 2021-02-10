import React, { useState } from 'react';
import { Button, Form, Grid, Input, Progress } from 'semantic-ui-react';
import createMultiSignatureTransaction from '../../utils/MultiSignatureTransactionHelper';
import {
    ColorType,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TransactionFeeDistribution,
    UpdateType,
} from '../../utils/types';
import createUpdateInstruction, {
    UpdateProps,
} from '../../utils/UpdateInstructionHelper';
import { rewardFractionResolution } from '../../constants/updateConstants.json';

function createTransaction(
    transactionFeeDistribution: TransactionFeeDistribution,
    sequenceNumber: BigInt,
    threshold: number
): Partial<MultiSignatureTransaction> {
    const updateInstruction = createUpdateInstruction(
        transactionFeeDistribution,
        UpdateType.UpdateTransactionFeeDistribution,
        sequenceNumber
    );
    const multiSignatureTransaction = createMultiSignatureTransaction(
        updateInstruction,
        threshold,
        MultiSignatureTransactionStatus.Open
    );
    return multiSignatureTransaction;
}

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

    if (!transactionFeeDistribution) {
        setTransactionFeeDistribution({
            baker: currentBakerFee,
            gasAccount: currentGasAccountFee,
        });
        return null;
    }

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
                                    if (e.target.value) {
                                        let bakerValue;
                                        try {
                                            bakerValue = parseInt(
                                                e.target.value,
                                                10
                                            );
                                        } catch (error) {
                                            // Input not a valid integer. Do nothing.
                                            return;
                                        }

                                        if (
                                            bakerValue >
                                                rewardFractionResolution ||
                                            bakerValue +
                                                transactionFeeDistribution.gasAccount >
                                                rewardFractionResolution
                                        ) {
                                            return;
                                        }

                                        setTransactionFeeDistribution({
                                            ...transactionFeeDistribution,
                                            baker: bakerValue,
                                        });
                                    }
                                }}
                            />
                            <Form.Field
                                label="New gas account share (/100000)"
                                control={Input}
                                value={transactionFeeDistribution.gasAccount.toString()}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    if (e.target.value) {
                                        let gasAccountValue;
                                        try {
                                            gasAccountValue = parseInt(
                                                e.target.value,
                                                10
                                            );
                                        } catch (error) {
                                            // Input not a valid integer. Do nothing.
                                            return;
                                        }
                                        if (
                                            gasAccountValue >
                                                rewardFractionResolution ||
                                            gasAccountValue +
                                                transactionFeeDistribution.baker >
                                                rewardFractionResolution
                                        ) {
                                            return;
                                        }

                                        setTransactionFeeDistribution({
                                            ...transactionFeeDistribution,
                                            gasAccount: gasAccountValue,
                                        });
                                    }
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid>
            <Button
                primary
                onClick={() =>
                    forwardTransaction(
                        createTransaction(
                            transactionFeeDistribution,
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
