import React, { useMemo } from 'react';
import {
    instanceOfScheduledTransfer,
    instanceOfScheduledTransferWithMemo,
    instanceOfSimpleTransfer,
    instanceOfSimpleTransferWithMemo,
    instanceOfUpdateInstruction,
    instanceOfUpdateAccountCredentials,
    MultiSignatureTransaction,
    instanceOfRegisterData,
    instanceOfAddBaker,
    instanceOfRemoveBaker,
    instanceOfUpdateBakerKeys,
    instanceOfUpdateBakerStake,
    instanceOfUpdateBakerRestakeEarnings,
} from '~/utils/types';
import ChainUpdateProposalStatus from './ChainUpdateProposalStatus';
import GtuTransferProposalStatus from './GtuTransferProposalStatus';
import UpdateAccountCredentialsProposalStatus from './UpdateAccountCredentialStatus';
import { ProposalStatusViewProps } from './ProposalStatusView';
import AddBakerProposalStatus from './AddBakerStatus';
import UpdateBakerKeysProposalStatus from './UpdateBakerKeysStatus';
import RemoveBakerProposalStatus from './RemoveBakerStatus';
import UpdateBakerStakeProposalStatus from './UpdateBakerStake';
import UpdateBakerRestakeEarningsProposalStatus from './UpdateBakerRestakeEarnings';
import RegisterDataStatus from './RegisterDataStatus';
import { parse } from '~/utils/JSONHelper';

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
        instanceOfSimpleTransferWithMemo(parsed) ||
        instanceOfScheduledTransferWithMemo(parsed) ||
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

    if (instanceOfRegisterData(parsed)) {
        return (
            <RegisterDataStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    if (instanceOfUpdateBakerKeys(parsed)) {
        return (
            <UpdateBakerKeysProposalStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    if (instanceOfUpdateBakerStake(parsed)) {
        return (
            <UpdateBakerStakeProposalStatus
                {...proposalStatusProps}
                transaction={parsed}
                status={status}
            />
        );
    }

    if (instanceOfUpdateBakerRestakeEarnings(parsed)) {
        return (
            <UpdateBakerRestakeEarningsProposalStatus
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

    return <>Not supported yet...</>;
}
