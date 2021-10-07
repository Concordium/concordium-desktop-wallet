/* eslint-disable promise/catch-or-return */
import React, { useEffect, useState } from 'react';
import { lookupName } from '~/utils/addressBookHelpers';
import {
    UpdateAccountCredentials,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

interface GtuTransferProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: UpdateAccountCredentials;
    status: MultiSignatureTransactionStatus;
}

export default function UpdateAccountCredentialsProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: GtuTransferProposalStatusProps): JSX.Element {
    const [senderName, setSenderName] = useState<string | undefined>();

    const title = 'Update Account Credentials';
    useEffect(() => {
        lookupName(transaction.sender).then(setSenderName);
    }, [transaction.sender]);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName || transaction.sender}
            headerRight="Credential Update"
            status={status}
            title={title}
        >
            <span className="textFaded">
                Account: {senderName ? `${senderName} ` : ''} (
                {transaction.sender.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
