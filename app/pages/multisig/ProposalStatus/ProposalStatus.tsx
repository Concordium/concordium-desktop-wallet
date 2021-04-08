import { parse } from 'json-bigint';
import React, { useMemo } from 'react';
import {
    instanceOfScheduledTransfer,
    instanceOfSimpleTransfer,
    instanceOfUpdateInstruction,
    instanceOfUpdateAccountCredentials,
    MultiSignatureTransaction,
} from '~/utils/types';
import ChainUpdateProposalStatus from './ChainUpdateProposalStatus';
import GtuTransferProposalStatus from './GtuTransferProposalStatus';
import { ProposalStatusViewProps } from './ProposalStatusView';

interface ProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    proposal: MultiSignatureTransaction;
}

export default function ProposalStatus({
    proposal,
    ...proposalStatusProps
}: ProposalStatusProps): JSX.Element | null {
    const { status, transaction } = proposal;
    const parsed = useMemo(() => parse(transaction), [transaction]);

    // TODO handle other transaction types...
    if (instanceOfUpdateInstruction(parsed)) {
        return (
            <ChainUpdateProposalStatus
                {...proposalStatusProps}
                status={status}
                transaction={parsed}
            />
        );
    }

    if (
        instanceOfSimpleTransfer(parsed) ||
        instanceOfScheduledTransfer(parsed)
    ) {
        return (
            <GtuTransferProposalStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    if (instanceOfUpdateAccountCredentials(parsed)) {
        return <p>UpdateAccountCredential</p>;
    }

    return <>Not supported yet...</>;
}
