/* eslint-disable promise/catch-or-return */
import React, { useEffect, useState } from 'react';
import { displayAsGTU } from '~/utils/gtu';

import { lookupName } from '~/utils/transactionHelpers';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    MultiSignatureTransactionStatus,
    ScheduledTransferPayload,
    SimpleTransferPayload,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

type GtuTransferTransaction = AccountTransaction<
    SimpleTransferPayload | ScheduledTransferPayload
>;

function getAmount(transaction: GtuTransferTransaction): number {
    if (instanceOfSimpleTransfer(transaction)) {
        return parseInt(transaction.payload.amount, 10);
    }

    return (transaction.payload as ScheduledTransferPayload).schedule.reduce(
        (acc, s) => acc + parseInt(s.amount, 10),
        0
    );
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
                {displayAsGTU(amount.toString())} to{' '}
                {receiverName ? `${receiverName} ` : ''}(
                {transaction.payload.toAddress.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
