import React from 'react';
import CopiableIdenticon from './CopiableIdenticon/CopiableIdenticon';

interface Props {
    transactionHash: string;
    setScreenshot?: (dataUrl: string) => void;
}

/**
 * Component that displays the hash and an identicon of the hash so that a user
 * can verify the integrity of a received transaction before signing it.
 */
export default function TransactionHashView({
    transactionHash,
    setScreenshot,
}: Props) {
    return (
        <>
            <CopiableIdenticon
                data={transactionHash}
                setScreenshot={setScreenshot}
            />
            <h5>Transaction hash</h5>
            {transactionHash}
        </>
    );
}
