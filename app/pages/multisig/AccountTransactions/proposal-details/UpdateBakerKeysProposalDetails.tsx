import React from 'react';
import { Account, BakerVerifyKeys, Fraction } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, PlainDetail } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';

interface Props {
    account?: Account;
    estimatedFee?: Fraction;
    bakerVerifyKeys: BakerVerifyKeys | undefined;
    expiryTime?: Date;
}

export default function UpdateBakerKeysProposalDetails({
    account,
    estimatedFee,
    bakerVerifyKeys,
    expiryTime,
}: Props) {
    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
            {bakerVerifyKeys ? (
                <>
                    <DisplayPublicKey
                        name="Election verify key"
                        publicKey={bakerVerifyKeys.electionVerifyKey}
                    />
                    <DisplayPublicKey
                        name="Signature verify key"
                        publicKey={bakerVerifyKeys.signatureVerifyKey}
                    />
                    <DisplayPublicKey
                        name="Aggregation verify key"
                        publicKey={bakerVerifyKeys.aggregationVerifyKey}
                    />
                </>
            ) : (
                <PlainDetail title="Public keys" />
            )}
        </Details>
    );
}
