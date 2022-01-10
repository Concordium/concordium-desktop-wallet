import React from 'react';
import AccountTransactionFlow, {
    FlowPageProps,
} from '../../AccountTransactionFlow';

type DetailsState = {
    stake: string;
    restake: boolean;
};

interface KeysState {
    aggKey: string;
}

interface BakerState {
    keys: KeysState;
    details: DetailsState;
}

type DetailsProps = FlowPageProps<DetailsState>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BakerDetailsPage({ onNext }: DetailsProps) {
    return (
        <>
            Add baker details
            <button
                type="button"
                onClick={() => onNext({ stake: '0', restake: true })}
            >
                Continue
            </button>
        </>
    );
}

export default function AddBaker() {
    return (
        <AccountTransactionFlow<BakerState>
            title="Add baker"
            serializeTransaction={(values) => JSON.stringify(values)}
        >
            {{
                details: { component: BakerDetailsPage },
                keys: {
                    // eslint-disable-next-line react/display-name
                    component: () => <>Keys</>,
                    title: 'Export keys',
                },
            }}
        </AccountTransactionFlow>
    );
}
