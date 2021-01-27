import { push } from 'connected-react-router';
import React, { useState } from 'react';
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

/**
 * Creates a multi signature transaction containing an update instruction for updating
 * the micro GTU per euro exchange rate.
 */
function createTransaction(microGtuPerEuro: BigInt): MultiSignatureTransaction {
    const exchangeRatePayload: ExchangeRate = {
        numerator: microGtuPerEuro,
        denominator: BigInt(1),
    };

    const updateInstruction = createUpdateInstruction(
        exchangeRatePayload,
        UpdateType.UpdateMicroGTUPerEuro
    );
    // TODO The threshold should be read from on-chain parameters.
    const multiSignatureTransaction = createMultiSignatureTransaction(
        updateInstruction,
        1,
        MultiSignatureTransactionStatus.Open
    );

    return multiSignatureTransaction;
}

export default function UpdateMicroGtuPerEuroRate() {
    const [microGtuPerEuro, setMicroGtuPerEuro] = useState<BigInt>();
    const [
        currentMicroGtuPerEuro,
        setCurrentMicroGtuPerEuro,
    ] = useState<BigInt>();

    // TODO This value should be read from on-chain parameters.
    if (!currentMicroGtuPerEuro) {
        setCurrentMicroGtuPerEuro(BigInt(10000));
        setMicroGtuPerEuro(BigInt(10000));
    }

    const dispatch = useDispatch();

    async function generateTransaction() {
        if (microGtuPerEuro) {
            const multiSignatureTransaction = createTransaction(
                microGtuPerEuro
            );

            // Save to database.
            await insert(multiSignatureTransaction);

            // Set the current proposal in the state to the one that was just generated.
            dispatch(setCurrentProposal(multiSignatureTransaction));

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
                    readOnly
                    value={currentMicroGtuPerEuro?.toString()}
                />
                <Form.Input
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
                <Form.Field>
                    <Button primary onClick={generateTransaction}>
                        Generate transaction proposal
                    </Button>
                </Form.Field>
            </Form>
        </Segment>
    );
}
