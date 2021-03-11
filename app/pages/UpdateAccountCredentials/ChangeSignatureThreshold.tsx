import React from 'react';
import Form from '../../components/Form';

interface Props {
    setReady: (ready: boolean) => void;
    currentThreshold: number;
    newThreshold: number;
    setNewThreshold: (threshold: number) => void;
}

// TODO: Validate that the threshold is <= amount of credentials
export default function ChangeThreshold({
    setReady,
    currentThreshold,
    newThreshold,
    setNewThreshold,
}: Props): JSX.Element {
    setReady(true);
    return (
        <>
            <h1>Propose new signature threshold for the account?</h1>
            <h3>
                If you want to update the amount of required signatures to make
                transactions from the account, you can do so below. If you do
                not want to make changes to the threshold, you can just leave it
                as it is.
            </h3>

            <h2>Current signature threshold:</h2>
            {currentThreshold}

            <h2>New signature threshold:</h2>
            <Form onSubmit={() => {}}>
                <Form.Input
                    name="newThreshold"
                    placeholder="new threshold"
                    value={newThreshold}
                    type="number"
                    onChange={(e) => {
                        setNewThreshold(parseInt(e.target.value, 10));
                    }}
                />
            </Form>
        </>
    );
}
