import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import {
    UpdateBakerStake,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface UpdateBakerStakeProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: UpdateBakerStake;
    status: MultiSignatureTransactionStatus;
}

export default function UpdateBakerStakeProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: UpdateBakerStakeProposalStatusProps): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Update baker stake"
            status={status}
            title="Update baker stake"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
