import React from 'react';
import { useRouteMatch } from 'react-router';
import { UpdateBakerKeys } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { useAccountName } from '~/utils/dataHooks';
import DisplayTransactionExpiryTime from '../DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import routes from '~/constants/routes.json';
import { DisplayFromAccount } from './DisplayAccount';
import DisplayPublicKey from './DisplayPublicKey';

interface Props {
    transaction: UpdateBakerKeys;
}

/**
 * Displays an overview of an Update-Baker-Keys-Transaction.
 */
export default function DisplayUpdateBakerKeys({ transaction }: Props) {
    const senderName = useAccountName(transaction.sender);
    const isSingleSig = useRouteMatch(routes.SUBMITTRANSFER);

    return (
        <>
            <DisplayFromAccount
                name={senderName}
                address={transaction.sender}
            />
            <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={transaction.payload.electionVerifyKey}
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={transaction.payload.signatureVerifyKey}
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
                publicKey={transaction.payload.aggregationVerifyKey}
            />
            {Boolean(isSingleSig) || (
                <DisplayTransactionExpiryTime
                    expiryTime={dateFromTimeStamp(transaction.expiry)}
                />
            )}
        </>
    );
}
