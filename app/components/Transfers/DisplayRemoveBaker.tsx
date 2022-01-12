import React from 'react';
import { useRouteMatch } from 'react-router';
import { RemoveBaker } from '~/utils/types';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import { DisplayFromAccount } from './DisplayAccount';

interface Props {
    transaction: RemoveBaker;
}

/**
 * Displays an overview of remove baker transaction.
 */
export default function DisplayAddBaker({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <DisplayFromAccount
                name={senderName}
                address={transaction.sender}
            />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
