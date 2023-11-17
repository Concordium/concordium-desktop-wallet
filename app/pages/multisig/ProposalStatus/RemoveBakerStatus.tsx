import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import { RemoveBaker, MultiSignatureTransactionStatus } from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface RemoveBakerProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: RemoveBaker;
    status: MultiSignatureTransactionStatus;
}

export default function RemoveBakerProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: RemoveBakerProposalStatusProps): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Remove validator"
            status={status}
            title="Remove validator"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
