import { parse } from 'json-bigint';
import React, { useMemo } from 'react';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
} from '~/utils/types';
import ChainUpdateProposalStatus from './ChainUpdateProposalStatus';

export default function ProposalStatus({
    status,
    transaction,
}: MultiSignatureTransaction): JSX.Element | null {
    const parsed = useMemo(() => parse(transaction), [transaction]);

    // TODO handle other transaction types...
    if (instanceOfUpdateInstruction(parsed)) {
        return (
            <ChainUpdateProposalStatus status={status} transaction={parsed} />
        );
    }

    return <>Transaction type unsupported...</>;
}
