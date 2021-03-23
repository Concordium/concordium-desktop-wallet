import React from 'react';
import CopiableIdenticon from './CopiableIdenticon/CopiableIdenticon';

interface Props {
    transactionHash: string;
}

/**
 * Component that displays the hash and an identicon of the hash so that a user
 * can verify the integrity of a received transaction before signing it.
 */
export default function TransactionHashView({ transactionHash }: Props) {
    return (
        <>
            <h3>Transaction identicon</h3>
            <CopiableIdenticon data={transactionHash} />
            <h3>Transaction hash</h3>
            {transactionHash}
        </>
    );
}
