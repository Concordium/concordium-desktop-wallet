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
            <CopiableIdenticon data={transactionHash} />
            <h5>Transaction hash</h5>
            {transactionHash}
        </>
    );
}
