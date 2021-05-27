import React from 'react';
import CopiableIdenticon from './CopiableIdenticon/CopiableIdenticon';

interface Props {
    transactionSignDigest: string;
    setScreenshot?: (dataUrl: string) => void;
}

/**
 * Component that displays the sign digest and an identicon of the digest so that a user
 * can verify the integrity of a received transaction before signing it.
 */
export default function TransactionSignDigestView({
    transactionSignDigest,
    setScreenshot,
}: Props) {
    return (
        <>
            <CopiableIdenticon
                data={transactionSignDigest}
                setScreenshot={setScreenshot}
            />
            <h5>Digest to sign</h5>
            {transactionSignDigest}
        </>
    );
}
