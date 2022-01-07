import React from 'react';
import AccountTransactionFlow from '../../AccountTransactionFlow';

interface BakerState {
    keys: string;
    stake: string;
}

// type DetailsState = Pick<BakerState, 'stake'>;
type DetailsState = { test: string };

interface DetailsProps {
    initial: DetailsState | undefined;
    onNext(values: DetailsState): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BakerDetailsPage(_: DetailsProps) {
    return <>Add baker details</>;
}

export default function AddBaker() {
    return (
        <AccountTransactionFlow<BakerState>
            title="Add baker"
            serializeTransaction={JSON.stringify}
        >
            <AccountTransactionFlow.Page<DetailsState, typeof BakerDetailsPage>
                as={BakerDetailsPage}
            />
        </AccountTransactionFlow>
    );
}
