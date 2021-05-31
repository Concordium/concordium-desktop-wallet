/* eslint-disable promise/catch-or-return */
import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import {
    MultiSignatureTransactionStatus,
    UpdateBakerRestakeEarnings,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface UpdateBakerRestakeEarningsProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: UpdateBakerRestakeEarnings;
    status: MultiSignatureTransactionStatus;
}

export default function UpdateBakerRestakeEarningsProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: UpdateBakerRestakeEarningsProposalStatusProps): JSX.Element {
    const senderName = useAccountName(transaction.sender);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Update Baker Restake Earnings"
            status={status}
            title="Update Baker Restake Earnings"
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
