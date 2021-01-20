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
import { UpdateHeader, UpdateInstruction, UpdateType } from '../../utils/types';
import { insert } from '../../database/MultiSignatureProposalDao';

export interface ExchangeRate {
    // Word 64
    numerator: number;
    // Word 64
    denominator: number;
}

/**
 * The model for multi signature transaction proposals, which maps into the
 * database model as well.
 */
export interface MultiSignatureTransaction {
    // The JSON serialization of the transaction
    transaction: string;
    // The minimum required signatures for the transaction
    // to be accepted on chain.
    threshold: number;

    status: string;
}

// Generate transaction proposal, should the proposer be the first to sign it? I think that makes sense if that were to be the case.

/**
 * Test function for generating a static update instruction. This should happen dynamically based on the
 * transaction that is currently being created by the user.
 */
function generateUpdateInstruction(
    microGtuPerEuro: number
): MultiSignatureTransaction {
    const exchangeRatePayload: ExchangeRate = {
        numerator: microGtuPerEuro,
        denominator: 1,
    };

    // Payload size is statically 17 for ExchangeRate transaction types.
    const updateHeader: UpdateHeader = {
        effectiveTime: 0,
        payloadSize: 17,
        sequenceNumber: 0,
        timeout: 0,
    };

    const updateInstruction: UpdateInstruction = {
        header: updateHeader,
        payload: exchangeRatePayload,
        signatures: [],
        type: UpdateType.UpdateMicroGTUPerEuro,
    };

    const transaction: MultiSignatureTransaction = {
        transaction: JSON.stringify(updateInstruction),
        threshold: 3,
        status: 'open',
    };

    return transaction;
}

export default function UpdateMicroGtuPerEuroRate() {
    const [microGtuPerEuro, setMicroGtuPerEuro] = useState<number>();

    const dispatch = useDispatch();

    async function generateTransaction() {
        if (microGtuPerEuro) {
            const instruction = generateUpdateInstruction(microGtuPerEuro);

            // Set the current proposal in the state to the one that was just generated.
            updateCurrentProposal(dispatch, instruction);

            // Save to database.
            await insert(instruction);

            // Navigate to the page that displays the current proposal from the state.
            dispatch(push(routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING));
        }
    }

    return (
        <Segment>
            <Header>Transaction Proposal | Update MicroGTU Per Euro</Header>
            <Divider />
            <Form>
                <Form.Input
                    width="5"
                    label="Current micro GTU per euro rate"
                    value={10000}
                    readOnly
                />
                <Form.Input
                    width="5"
                    label="New micro GTU per euro rate"
                    value={microGtuPerEuro}
                    onChange={(e) => {
                        if (e.target.value) {
                            setMicroGtuPerEuro(parseInt(e.target.value));
                        }
                    }}
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
