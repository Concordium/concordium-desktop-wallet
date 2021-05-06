/* eslint-disable promise/catch-or-return */
import React, { useEffect, useState } from 'react';
import { displayAsGTU } from '~/utils/gtu';

import {
    getScheduledTransferAmount,
    lookupName,
} from '~/utils/transactionHelpers';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    MultiSignatureTransactionStatus,
    ScheduledTransfer,
    ScheduledTransferPayload,
    SimpleTransferPayload,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

type GtuTransferTransaction = AccountTransaction<
    SimpleTransferPayload | ScheduledTransferPayload
>;

function getAmount(transaction: GtuTransferTransaction): bigint {
    if (instanceOfSimpleTransfer(transaction)) {
        return BigInt(transaction.payload.amount);
    }

    return getScheduledTransferAmount(transaction as ScheduledTransfer);
}

interface GtuTransferProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: GtuTransferTransaction;
    status: MultiSignatureTransactionStatus;
}

export default function GtuTransferProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: GtuTransferProposalStatusProps): JSX.Element {
    const [senderName, setSenderName] = useState<string | undefined>();
    const [receiverName, setReceiverName] = useState<string | undefined>();

    const amount = getAmount(transaction);
    const title = instanceOfSimpleTransfer(transaction)
        ? 'GTU Transfer'
        : 'GTU Transfer with a Schedule';

    useEffect(() => {
        lookupName(transaction.sender).then(setSenderName);
    }, [transaction.sender]);

    useEffect(() => {
        lookupName(transaction.payload.toAddress).then(setReceiverName);
    }, [transaction.payload.toAddress]);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={senderName || transaction.sender}
            headerRight="GTU Transfer"
            status={status}
            title={title}
        >
            <span className="textFaded">
                {displayAsGTU(amount)} to{' '}
                {receiverName ? `${receiverName} ` : ''}(
                {transaction.payload.toAddress.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
