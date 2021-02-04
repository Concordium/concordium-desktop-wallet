import React, { useState } from 'react';
import {
    Button,
    Divider,
    Form,
    Header,
    Input,
    Segment,
} from 'semantic-ui-react';
import createMultiSignatureTransaction from '../../utils/MultiSignatureTransactionHelper';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import createUpdateInstruction, {
    UpdateProps,
} from '../../utils/UpdateInstructionHelper';

function createTransaction(
    euroPerEnergy: ExchangeRate,
    sequenceNumber: BigInt,
    threshold: number
): MultiSignatureTransaction {
    const updateInstruction = createUpdateInstruction(
        euroPerEnergy,
        UpdateType.UpdateEuroPerEnergy,
        sequenceNumber
    );
    const multiSignatureTransaction = createMultiSignatureTransaction(
        updateInstruction,
        threshold,
        MultiSignatureTransactionStatus.Open
    );
    return multiSignatureTransaction;
}

export default function UpdateEuroPerEnergy({
    blockSummary,
    generateTransaction,
}: UpdateProps) {
    const [euroPerEnergy, setEuroPerEnergy] = useState<ExchangeRate>();
    const currentEuroPerEnergy =
        blockSummary.updates.chainParameters.euroPerEnergy;
    const sequenceNumber =
        blockSummary.updates.updateQueues.euroPerEnergy.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.euroPerEnergy;

    if (!euroPerEnergy) {
        setEuroPerEnergy(currentEuroPerEnergy);
        return null;
    }

    return (
        <Segment>
            <Header>Transaction Proposal | Update Euro Per Energy</Header>
            <Divider />
            <Form>
                <Form.Group widths="equal">
                    <Form.Field
                        label="Current euro per energy"
                        readOnly
                        control={Input}
                        value={`${currentEuroPerEnergy.numerator}/${currentEuroPerEnergy.denominator}`}
                    />
                </Form.Group>
                <Form.Group widths="equal">
                    <Form.Field
                        label="New euro per energy numerator"
                        control={Input}
                        value={euroPerEnergy?.numerator.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.value) {
                                try {
                                    setEuroPerEnergy({
                                        numerator: BigInt(e.target.value),
                                        denominator: euroPerEnergy.denominator,
                                    });
                                } catch (error) {
                                    // The input was not a valid BigInt, so do no updates based on the input.
                                }
                            }
                        }}
                    />
                    <Form.Field
                        label="New euro per energy denominator"
                        control={Input}
                        value={euroPerEnergy?.denominator.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.value) {
                                try {
                                    setEuroPerEnergy({
                                        denominator: BigInt(e.target.value),
                                        numerator: euroPerEnergy.numerator,
                                    });
                                } catch (error) {
                                    // The input was not a valid BigInt, so do no updates based on the input.
                                }
                            }
                        }}
                    />
                </Form.Group>
            </Form>
            <Button
                primary
                onClick={() =>
                    generateTransaction(
                        createTransaction(
                            euroPerEnergy,
                            sequenceNumber,
                            threshold
                        )
                    )
                }
            >
                Generate transaction proposal
            </Button>
        </Segment>
    );
}
