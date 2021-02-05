import { push } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Divider, Form, Header, Segment } from 'semantic-ui-react';
import { stringify } from 'json-bigint';
import routes from '../../constants/routes.json';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import createUpdateInstruction from '../../utils/UpdateInstructionHelper';
import createMultiSignatureTransaction from '../../utils/MultiSignatureTransactionHelper';
import { BlockSummary } from '../../utils/NodeApiTypes';

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

interface Props {
    blockSummary: BlockSummary;
}

export default function UpdateMicroGtuPerEuroRate({ blockSummary }: Props) {
    const [microGtuPerEuro, setMicroGtuPerEuro] = useState<BigInt>();
    const [
        currentMicroGtuPerEuro,
        setCurrentMicroGtuPerEuro,
    ] = useState<BigInt>();

    if (!currentMicroGtuPerEuro) {
        setCurrentMicroGtuPerEuro(
            blockSummary.updates.chainParameters.microGTUPerEuro.numerator
        );
        setMicroGtuPerEuro(
            blockSummary.updates.chainParameters.microGTUPerEuro.numerator
        );
    }

    const dispatch = useDispatch();

    async function generateTransaction() {
        if (microGtuPerEuro) {
            const multiSignatureTransaction = createTransaction(
                microGtuPerEuro,
                blockSummary.updates.updateQueues.microGTUPerEuro
                    .nextSequenceNumber,
                blockSummary.updates.authorizations.microGTUPerEuro.threshold
            );

            // Navigate to signing page.
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                    state: stringify(multiSignatureTransaction),
                })
            );
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
                    value={currentMicroGtuPerEuro?.toString()}
                />
                <Form.Input
                    inline
                    width="5"
                    label="New micro GTU per euro rate"
                    value={microGtuPerEuro?.toString()}
                    onChange={(e) => {
                        if (e.target.value) {
                            try {
                                setMicroGtuPerEuro(BigInt(e.target.value));
                            } catch (error) {
                                // The input was not a valid BigInt, so do no updates based on the input.
                            }
                        }
                    }}
                />
            </Form>
            <Button primary onClick={generateTransaction}>
                Generate transaction proposal
            </Button>
        </Segment>
    );
}
