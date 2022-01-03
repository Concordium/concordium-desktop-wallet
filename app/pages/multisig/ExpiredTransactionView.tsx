import React from 'react';
import { useCurrentTime } from '~/utils/hooks';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import { getTimeout } from '~/utils/transactionHelpers';
import {
    Transaction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';

interface Props {
    proposal?: MultiSignatureTransaction;
    transaction: Transaction;
}

export default function ExpiredTransactionView({
    transaction,
    proposal,
}: Props) {
    // TODO Note that it is the timeout/expiration that we react on as that is always prior to the
    // effective time. This makes sense currently as the expiration is always 1 second earlier than the
    // effective time, but that might not be the case we end up with. If we change that, then this
    // should be reconsidered.

    const now = useCurrentTime();
    const expiry = dateFromTimeStamp(getTimeout(transaction));

    if (
        proposal?.status === MultiSignatureTransactionStatus.Expired ||
        expiry < now
    ) {
        return (
            <span className="textError mono">The transaction has expired</span>
        );
    }
    return null;
}
