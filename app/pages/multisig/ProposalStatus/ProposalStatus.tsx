import { parse } from 'json-bigint';
import React, { useMemo } from 'react';
import {
    instanceOfUpdateInstruction,
    instanceOfUpdateAccountCredentials,
    MultiSignatureTransaction,
    instanceOfAddBaker,
    instanceOfRemoveBaker,
} from '~/utils/types';
import ChainUpdateProposalStatus from './ChainUpdateProposalStatus';
import UpdateAccountCredentialsProposalStatus from './UpdateAccountCredentialStatus';
import { ProposalStatusViewProps } from './ProposalStatusView';
import AddBakerProposalStatus from './AddBakerStatus';
import RemoveBakerProposalStatus from './RemoveBakerStatus';

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

    if (instanceOfRemoveBaker(parsed)) {
        return (
            <RemoveBakerProposalStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    return <>Transaction type unsupported...</>;
}
