/* eslint-disable promise/catch-or-return */
import React, { useEffect, useState } from 'react';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';

import { getScheduledTransferAmount } from '~/utils/transactionHelpers';
import { lookupName } from '~/utils/addressBookHelpers';
import {
    AccountTransaction,
    instanceOfSimpleTransfer,
    instanceOfSimpleTransferWithMemo,
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

function getSpecifics(
    transaction: GtuTransferTransaction
): { amount: bigint; title: string } {
    if (
        instanceOfSimpleTransfer(transaction) ||
        instanceOfSimpleTransferWithMemo(transaction)
    ) {
        return {
            amount: BigInt(transaction.payload.amount),
            title: 'CCD transfer',
        };
    }
    return {
        amount: getScheduledTransferAmount(transaction as ScheduledTransfer),
        title: 'CCD transfer with a schedule',
    };
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

    const { amount, title } = getSpecifics(transaction);

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
            headerRight="CCD transfer"
            status={status}
            title={title}
        >
            <span className="textFaded">
                {displayAsCcd(amount)} to{' '}
                {receiverName ? `${receiverName} ` : ''}(
                {transaction.payload.toAddress.substr(0, 8)}...)
            </span>
        </ProposalStatusView>
    );
}
