import { push } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button,
    Divider,
    Form,
    Header,
    Input,
    Segment,
} from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { updateCurrentProposal } from '../../features/MultiSignatureSlice';
import {
    ExchangeRate,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import { insert } from '../../database/MultiSignatureProposalDao';
import createUpdateInstruction from '../../utils/UpdateInstructionHelper';
import createMultiSignatureTransaction from '../../utils/MultiSignatureTransactionHelper';
import { BlockSummary } from '../../utils/client';

/**
 * Creates a multi signature transaction containing an update instruction for updating
 * the micro GTU per euro exchange rate.
 */
function createTransaction(
    microGtuPerEuro: number,
    sequenceNumber: number,
    threshold: number
): MultiSignatureTransaction {
    const exchangeRatePayload: ExchangeRate = {
        numerator: microGtuPerEuro,
        denominator: 1,
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
    const [microGtuPerEuro, setMicroGtuPerEuro] = useState<number>();
    const [
        currentMicroGtuPerEuro,
        setCurrentMicroGtuPerEuro,
    ] = useState<number>();

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

            // Set the current proposal in the state to the one that was just generated.
            updateCurrentProposal(dispatch, multiSignatureTransaction);

            // Save to database.
            await insert(multiSignatureTransaction);

            // Navigate to the page that displays the current proposal from the state.
            dispatch(push(routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING));
        }
    }

    return (
        <Segment>
            <Header>Transaction Proposal | Update MicroGTU Per Euro</Header>
            <Divider />
            <Form>
                <Form.Field inline>
                    <Input
                        width="5"
                        label="Current micro GTU per euro rate"
                        readOnly
                        value={currentMicroGtuPerEuro}
                    />
                </Form.Field>
                <Form.Field inline>
                    <Input
                        width="5"
                        label="New micro GTU per euro rate"
                        value={microGtuPerEuro}
                        onChange={(e) => {
                            if (e.target.value) {
                                setMicroGtuPerEuro(
                                    parseInt(e.target.value, 10)
                                );
                            }
                        }}
                    />
                </Form.Field>
                <Form.Field>
                    <Button primary onClick={generateTransaction}>
                        Generate transaction proposal
                    </Button>
                </Form.Field>
            </Form>
        </Segment>
    );
}
