import React from 'react';
import { FoundationAccount } from '../../utils/types';

interface Props {
    foundationAccount: FoundationAccount;
}

/**
 * Displays an overview of a foundation account transaction payload.
 */
export default function FoundationAccountView({ foundationAccount }: Props) {
    return <>Foundation account: {foundationAccount.address}</>;
}
