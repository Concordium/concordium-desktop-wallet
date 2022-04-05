/* eslint-disable promise/catch-or-return */
import React from 'react';
import { useAccountName } from '~/utils/dataHooks';
import { RegisterData, MultiSignatureTransactionStatus } from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface AddBakerProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: RegisterData;
    status: MultiSignatureTransactionStatus;
}

const shownLength = 16;

export default function AddBakerProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: AddBakerProposalStatusProps): JSX.Element {
    const senderName = useAccountName(transaction.sender);
    const { data } = transaction.payload;
    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName ?? transaction.sender}
            headerRight="Register data"
            status={status}
            title="Register data"
        >
            <span className="textFaded">
                {data.substring(0, shownLength)}
                {data.length > shownLength ? '...' : null}
            </span>
        </ProposalStatusView>
    );
}
