import React from 'react';
import { Account, BakerVerifyKeys, Fraction, Identity } from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { AccountDetail, Details, PlainDetail } from './shared';
import PublicKey from '../../common/PublicKey/PublicKey';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';

interface Props {
    account?: Account;
    identity?: Identity;
    estimatedFee?: Fraction;
    bakerVerifyKeys?: BakerVerifyKeys;
    expiryTime?: Date;
}

export default function UpdateBakerKeysProposalDetails({
    identity,
    account,
    estimatedFee,
    bakerVerifyKeys,
    expiryTime,
}: Props) {
    return (
        <Details>
            <PlainDetail title="Identity" value={identity?.name} />
            <AccountDetail title="Account" value={account} />
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
            <PlainDetail
                title="Public keys"
                value={bakerVerifyKeys}
                format={(bakerKeys) => (
                    <>
                        <PublicKey
                            name="Election verify key"
                            publicKey={bakerKeys.electionVerifyKey}
                        />
                        <PublicKey
                            name="Signature verify key"
                            publicKey={bakerKeys.signatureVerifyKey}
                        />
                        <PublicKey
                            name="Aggregation verify key"
                            publicKey={bakerKeys.aggregationVerifyKey}
                        />
                    </>
                )}
            />
        </Details>
    );
}
