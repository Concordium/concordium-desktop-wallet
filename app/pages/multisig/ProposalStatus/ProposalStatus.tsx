import { parse } from 'json-bigint';
import React, { useMemo } from 'react';
import {
    instanceOfScheduledTransfer,
    instanceOfSimpleTransfer,
    instanceOfUpdateInstruction,
    instanceOfUpdateAccountCredentials,
    MultiSignatureTransaction,
    instanceOfAddBaker,
} from '~/utils/types';
import ChainUpdateProposalStatus from './ChainUpdateProposalStatus';
import GtuTransferProposalStatus from './GtuTransferProposalStatus';
import UpdateAccountCredentialsProposalStatus from './UpdateAccountCredentialStatus';
import { ProposalStatusViewProps } from './ProposalStatusView';
import AddBakerProposalStatus from './AddBakerStatus';

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
        return (
            <UpdateAccountCredentialsProposalStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    if (instanceOfAddBaker(parsed)) {
        return (
            <AddBakerProposalStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    return <>Not supported yet...</>;
}
