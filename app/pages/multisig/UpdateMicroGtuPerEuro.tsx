import React, { useState } from 'react';
import { Button, Divider, Form, Header, Segment } from 'semantic-ui-react';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import createUpdateInstruction, {
    UpdateProps,
} from '../../utils/UpdateInstructionHelper';
import createMultiSignatureTransaction from '../../utils/MultiSignatureTransactionHelper';

/**
 * Creates a multi signature transaction containing an update instruction for updating
 * the micro GTU per euro exchange rate.
 */
function createTransaction(
    microGtuPerEuro: BigInt,
    sequenceNumber: BigInt,
    threshold: number
): Partial<MultiSignatureTransaction> {
    const exchangeRatePayload: ExchangeRate = {
        numerator: microGtuPerEuro,
        denominator: 1n,
    };

    const updateInstruction = createUpdateInstruction(
        exchangeRatePayload,
        UpdateType.UpdateMicroGTUPerEuro,
        sequenceNumber
    );

    const multiSignatureTransaction = createMultiSignatureTransaction(
        updateInstruction,
        threshold,
        MultiSignatureTransactionStatus.Open
    );

    return multiSignatureTransaction;
}

export default function UpdateMicroGtuPerEuroRate({
    blockSummary,
    forwardTransaction,
}: UpdateProps): JSX.Element | null {
    const [microGtuPerEuro, setMicroGtuPerEuro] = useState<BigInt>();
    const [
        currentMicroGtuPerEuro,
        setCurrentMicroGtuPerEuro,
    ] = useState<BigInt>();

    const sequenceNumber =
        blockSummary.updates.updateQueues.microGTUPerEuro.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.microGTUPerEuro;

    if (!currentMicroGtuPerEuro) {
        setCurrentMicroGtuPerEuro(
            blockSummary.updates.chainParameters.microGTUPerEuro.numerator
        );
        setMicroGtuPerEuro(
            blockSummary.updates.chainParameters.microGTUPerEuro.numerator
        );
    }

    if (!microGtuPerEuro) {
        return null;
    }

    function trySetMicroGtuPerEuro(v: string): void {
        if (!v) {
            return;
        }

        try {
            setMicroGtuPerEuro(BigInt(v));
        } catch (error) {
            // The input was not a valid BigInt, so do no updates based on the input.
        }
    }

    return (
        <Segment>
            <Header>Transaction Proposal | Update MicroGTU Per Euro</Header>
            <Divider />
            <Form>
                <Form.Input
                    inline
                    width="5"
                    label="Current micro GTU per euro rate"
                    readOnly
                    type="number"
                    value={`${currentMicroGtuPerEuro}`}
                />
                <Form.Input
                    inline
                    width="5"
                    label="New micro GTU per euro rate"
                    value={`${microGtuPerEuro}`}
                    type="number"
                    onChange={(e) => trySetMicroGtuPerEuro(e.target.value)}
                />
            </Form>
            <Button
                primary
                // TODO Validate that the input is a reduced fraction (otherwise the chain will reject it anyway.)
                onClick={() =>
                    forwardTransaction(
                        createTransaction(
                            microGtuPerEuro,
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
