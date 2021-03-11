import React, { useEffect, useState } from 'react';
import { Form } from 'semantic-ui-react';
import { ExchangeRate, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/transactionTypes';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';

export default function UpdateMicroGtuPerEuroRate({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps): JSX.Element | null {
    const [microGtuPerEuro, setMicroGtuPerEuro] = useState<ExchangeRate>();
    const [
        currentMicroGtuPerEuro,
        setCurrentMicroGtuPerEuro,
    ] = useState<ExchangeRate>();

    const sequenceNumber =
        blockSummary.updates.updateQueues.microGTUPerEuro.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.microGTUPerEuro;

    if (!currentMicroGtuPerEuro) {
        const localCurrentMicroGtuPerEuro = {
            numerator:
                blockSummary.updates.chainParameters.microGTUPerEuro.numerator,
            denominator:
                blockSummary.updates.chainParameters.microGTUPerEuro
                    .denominator,
        };
        setCurrentMicroGtuPerEuro(localCurrentMicroGtuPerEuro);
        setMicroGtuPerEuro(localCurrentMicroGtuPerEuro);
    }

    useEffect(() => {
        if (microGtuPerEuro) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    microGtuPerEuro,
                    UpdateType.UpdateMicroGTUPerEuro,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        }
    }, [
        microGtuPerEuro,
        sequenceNumber,
        threshold,
        setProposal,
        effectiveTime,
    ]);

    if (!microGtuPerEuro || !currentMicroGtuPerEuro) {
        return null;
    }

    function trySetMicroGtuPerEuro(v: string): void {
        if (!v) {
            return;
        }

        try {
            setMicroGtuPerEuro({ numerator: BigInt(v), denominator: 1n });
        } catch (error) {
            // The input was not a valid BigInt, so do no updates based on the input.
        }
    }

    return (
        <>
            <Form>
                <Form.Input
                    inline
                    width="5"
                    label="Current micro GTU per euro rate"
                    readOnly
                    type="number"
                    value={`${currentMicroGtuPerEuro.numerator}`}
                />
                <Form.Input
                    inline
                    width="5"
                    label="New micro GTU per euro rate"
                    value={`${microGtuPerEuro.numerator}`}
                    type="number"
                    onChange={(e) => trySetMicroGtuPerEuro(e.target.value)}
                />
            </Form>
        </>
    );
}
