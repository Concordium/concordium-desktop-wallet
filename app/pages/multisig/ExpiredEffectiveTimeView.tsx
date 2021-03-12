import React from 'react';
import { Header } from 'semantic-ui-react';
import { getNow } from '../../utils/timeHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    Transaction,
    TimeStampUnit,
} from '../../utils/types';
import { getTimeout } from '../../utils/transactionHelpers';

interface Props {
    proposal?: MultiSignatureTransaction;
    transaction: Transaction;
}

export default function ExpiredEffectiveTimeView({
    transaction,
    proposal,
}: Props) {
    // TODO Note that it is the timeoute/expiration that we react on as that is always prior to the
    // effective time. This makes sense currently as the expiration is always 1 second earlier than the
    // effective time, but that might not be the case we end up with. If we change that, then this
    // should be reconsidered.
    if (
        (!proposal ||
            proposal.status === MultiSignatureTransactionStatus.Expired) &&
        getTimeout(transaction) <= getNow(TimeStampUnit.seconds)
    ) {
        return (
            <Header color="red" size="small">
                The transaction has expired
            </Header>
        );
    }
    return null;
}
