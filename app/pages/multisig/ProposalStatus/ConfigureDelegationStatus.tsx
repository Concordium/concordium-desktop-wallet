import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import {
    ConfigureDelegation,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface Props extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: ConfigureDelegation;
    status: MultiSignatureTransactionStatus;
}

export default function ConfigureDelegationProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: Props): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Configure delegation"
            status={status}
            title="Configure delegation"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
