import React from 'react';

import { EqualRecord, FoundationAccount } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form';

export interface UpdateFoundationAccountFields {
    foundationAccount: string;
}

const fieldNames: EqualRecord<UpdateFoundationAccountFields> = {
    foundationAccount: 'foundationAccount',
};

export default function UpdateFoundationAccount({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    // TODO We should not get the current foundation address from this field, as it is
    // kind of hacky. The current API does not support a better solution, but when it does
    // we should update this extraction.
    const currentFoundationAccount: FoundationAccount = {
        address: blockSummary.specialEvents[0].foundationAccount,
    };

    return (
        <>
            <div>
                <h3>Current foundation account address:</h3>
                <div>{currentFoundationAccount.address}</div>
            </div>
            <Form.TextArea
                name={fieldNames.foundationAccount}
                label="New foundation address"
                placeholder="Paste the new account address here"
            />
        </>
    );
}
