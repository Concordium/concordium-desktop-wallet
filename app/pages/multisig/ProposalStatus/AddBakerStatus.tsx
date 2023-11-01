import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import { AddBaker, MultiSignatureTransactionStatus } from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface AddBakerProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: AddBaker;
    status: MultiSignatureTransactionStatus;
}

export default function AddBakerProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: AddBakerProposalStatusProps): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Add validator"
            status={status}
            title="Add validator"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
