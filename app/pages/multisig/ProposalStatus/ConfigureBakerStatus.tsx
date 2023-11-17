import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import { ConfigureBaker, MultiSignatureTransactionStatus } from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface Props extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: ConfigureBaker;
    status: MultiSignatureTransactionStatus;
}

export default function ConfigureBakerProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: Props): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Configure validator"
            status={status}
            title="Configure validator"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
