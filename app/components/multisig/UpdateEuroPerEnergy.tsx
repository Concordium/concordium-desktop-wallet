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
import { BlockSummary } from '../../utils/NodeApiTypes';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import createUpdateInstruction from '../../utils/UpdateInstructionHelper';

interface Props {
    blockSummary: BlockSummary;
}

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

export default function UpdateEuroPerEnergy({ blockSummary }: Props) {
    const [euroPerEnergy, setEuroPerEnergy] = useState<ExchangeRate>();
    const currentEuroPerEnergy =
        blockSummary.updates.chainParameters.euroPerEnergy;

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
            <Button primary>Generate transaction proposal</Button>
        </Segment>
    );
}
