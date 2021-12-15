import React, { useEffect, useState } from 'react';
import { getTransactionHash } from '~/utils/transactionHash';
import { Transaction } from '~/utils/types';

interface Props {
    transaction: Transaction;
}

/**
 * Component that calculates and displays the transaction hash
 */
export default function TransactionHashView({ transaction }: Props) {
    const [transactionHash, setTransactionHash] = useState<string>();
    useEffect(() => {
        Promise.resolve(getTransactionHash(transaction))
            .then(setTransactionHash)
            .catch(() => {});
    }, [transaction]);

    return (
        <>
            <h5>Transaction hash</h5>
            {transactionHash}
        </>
    );
}
