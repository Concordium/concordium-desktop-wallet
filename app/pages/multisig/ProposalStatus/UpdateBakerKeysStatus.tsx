import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import {
    MultiSignatureTransactionStatus,
    UpdateBakerKeys,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface UpdateBakerKeysProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: UpdateBakerKeys;
    status: MultiSignatureTransactionStatus;
}

export default function UpdateBakerKeysProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: UpdateBakerKeysProposalStatusProps): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Update validator keys"
            status={status}
            title="Update validator keys"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
