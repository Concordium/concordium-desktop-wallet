import React from 'react';
import Form from '~/components/Form';
import AccountTransactionFlow, {
    FlowPageProps,
} from '../../AccountTransactionFlow';

interface StakeSettings {
    stake: string;
    restake: boolean;
}

type PoolOpen = boolean;

interface BakerState {
    stake: StakeSettings;
    poolOpen: PoolOpen;
}

type StakePageProps = FlowPageProps<StakeSettings>;
type PoolOpenPageProps = FlowPageProps<PoolOpen>;

const Continue = () => <Form.Submit>Continue</Form.Submit>;

function BakerDetailsPage({ onNext, initial }: StakePageProps) {
    return (
        <Form<StakeSettings> onSubmit={onNext} defaultValues={initial}>
            <p>
                To add a baker you must choose an amount to stake on the
                account. The staked amount will be part of the balance, but
                while staked the amount is unavailable for transactions.
            </p>
            <p>
                By default all rewards are added to the staked amount. This can
                be disabled below.
            </p>
            <Continue />
        </Form>
    );
}

function PoolOpenPage({ initial }: PoolOpenPageProps) {
    return <>Pool open settings: {initial ? 'Yes' : 'No'}</>;
}

export default function AddBaker() {
    return (
        <AccountTransactionFlow<BakerState>
            title="Add baker"
            serializeTransaction={(values) => JSON.stringify(values)}
        >
            {{
                stake: { component: BakerDetailsPage },
                poolOpen: { component: PoolOpenPage },
            }}
        </AccountTransactionFlow>
    );
}
