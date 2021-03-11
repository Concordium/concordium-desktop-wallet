import React, { useEffect, useState } from 'react';
import { Form } from 'semantic-ui-react';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { FoundationAccount, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/transactionTypes';

export default function UpdateFoundationAccount({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps): JSX.Element | null {
    const [
        foundationAccount,
        setFoundationAccount,
    ] = useState<FoundationAccount>();

    // TODO We should not get the current foundation address from this field, as it is
    // kind of hacky. The current API does not support a better solution, but when it does
    // we should update this extraction.
    const currentFoundationAccount: FoundationAccount = {
        address: blockSummary.specialEvents[0].foundationAccount,
    };
    const sequenceNumber =
        blockSummary.updates.updateQueues.foundationAccount.nextSequenceNumber;
    const { threshold } = blockSummary.updates.authorizations.foundationAccount;

    useEffect(() => {
        if (foundationAccount) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    foundationAccount,
                    UpdateType.UpdateFoundationAccount,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        }
    }, [
        foundationAccount,
        sequenceNumber,
        threshold,
        setProposal,
        effectiveTime,
    ]);

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
        </>
    );
}
