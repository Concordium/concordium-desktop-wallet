import { push } from 'connected-react-router';
import React, { useState, ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Divider, Form, Header, Segment } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { setCurrentProposal } from '../../features/MultiSignatureSlice';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import { insert } from '../../database/MultiSignatureProposalDao';
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

export default function UpdateMicroGtuPerEuroRate({
    blockSummary,
}: Props): ReactElement {
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

            // Save to database and use the assigned id to update the local object.
            const entryId = (await insert(multiSignatureTransaction))[0];
            multiSignatureTransaction.id = entryId;

            // Set the current proposal in the state to the one that was just generated.
            dispatch(setCurrentProposal(multiSignatureTransaction));

            // Navigate to the page that displays the current proposal from the state.
            dispatch(push(routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING));
        }
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
                <Form.Field>
                    <Button primary onClick={generateTransaction}>
                        Generate transaction proposal
                    </Button>
                </Form.Field>
            </Form>
        </Segment>
    );
}
