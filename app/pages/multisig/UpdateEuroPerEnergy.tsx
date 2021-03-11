import React, { useEffect, useState } from 'react';
import { Form, Input } from 'semantic-ui-react';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { UpdateProps } from '../../utils/transactionTypes';
import { ExchangeRate, UpdateType } from '../../utils/types';

export default function UpdateEuroPerEnergy({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps) {
    const [euroPerEnergy, setEuroPerEnergy] = useState<ExchangeRate>();
    const currentEuroPerEnergy =
        blockSummary.updates.chainParameters.euroPerEnergy;
    const sequenceNumber =
        blockSummary.updates.updateQueues.euroPerEnergy.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.euroPerEnergy;

    useEffect(() => {
        if (euroPerEnergy && effectiveTime) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    euroPerEnergy,
                    UpdateType.UpdateEuroPerEnergy,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        }
    }, [euroPerEnergy, sequenceNumber, threshold, setProposal, effectiveTime]);

    if (!euroPerEnergy) {
        setEuroPerEnergy(currentEuroPerEnergy);
        return null;
    }

    return (
        <>
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
        </>
    );
}
