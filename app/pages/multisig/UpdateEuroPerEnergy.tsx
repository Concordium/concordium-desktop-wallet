import React, { useState } from 'react';
import {
    Button,
    Divider,
    Form,
    Header,
    Input,
    Segment,
} from 'semantic-ui-react';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { ExchangeRate, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/UpdateInstructionHelper';

export default function UpdateEuroPerEnergy({
    blockSummary,
    forwardTransaction,
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
                    forwardTransaction(
                        createUpdateMultiSignatureTransaction(
                            euroPerEnergy,
                            UpdateType.UpdateMicroGTUPerEuro,
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
