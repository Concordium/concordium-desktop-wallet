import React from 'react';
import { Label } from 'semantic-ui-react';
import { FoundationAccount } from '../../utils/types';

interface Props {
    foundationAccount: FoundationAccount;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default function FoundationAccountView({ foundationAccount }: Props) {
    return (
        <Label size="big">
            Foundation account
            {foundationAccount.address}
        </Label>
    );
}
