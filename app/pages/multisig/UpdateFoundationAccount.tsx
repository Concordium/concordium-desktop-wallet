import React, { useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import createMultiSignatureTransaction from '../../utils/MultiSignatureTransactionHelper';
import {
    FoundationAccount,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import createUpdateInstruction, {
    UpdateProps,
} from '../../utils/UpdateInstructionHelper';

function createTransaction(
    foundationAccount: FoundationAccount,
    sequenceNumber: BigInt,
    threshold: number
): Partial<MultiSignatureTransaction> {
    const updateInstruction = createUpdateInstruction(
        foundationAccount,
        UpdateType.UpdateFoundationAccount,
        sequenceNumber
    );
    const multiSignatureTransaction = createMultiSignatureTransaction(
        updateInstruction,
        threshold,
        MultiSignatureTransactionStatus.Open
    );
    return multiSignatureTransaction;
}

export default function UpdateFoundationAccount({
    blockSummary,
    forwardTransaction,
}: UpdateProps): JSX.Element | null {
    const [
        foundationAccount,
        setFoundationAccount,
    ] = useState<FoundationAccount>();

    const currentFoundationAccount: FoundationAccount = {
        address: blockSummary.specialEvents[0].foundationAccount,
    };
    const sequenceNumber =
        blockSummary.updates.updateQueues.foundationAccount.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.foundationAccount;

    if (!foundationAccount) {
        setFoundationAccount(currentFoundationAccount);
        return null;
    }

    return (
        <>
            <Form>
                <Form.Input
                    inline
                    width="5"
                    label="Current foundation address"
                    readOnly
                    type="string"
                    value={`${currentFoundationAccount.address}`}
                />
                <Form.Input
                    inline
                    width="5"
                    label="New foundation address"
                    value={`${foundationAccount.address}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // TODO Validate that it is a base58 address.
                        const newFoundationAccount: FoundationAccount = {
                            address: e.target.value,
                        };
                        setFoundationAccount(newFoundationAccount);
                    }}
                />
            </Form>
            <Button
                primary
                onClick={() =>
                    forwardTransaction(
                        createTransaction(
                            foundationAccount,
                            sequenceNumber,
                            threshold
                        )
                    )
                }
            >
                Generate transaction proposal
            </Button>
        </>
    );
}
