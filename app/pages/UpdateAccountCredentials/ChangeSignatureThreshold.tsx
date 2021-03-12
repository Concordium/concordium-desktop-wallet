import React, { useEffect } from 'react';
import Form from '../../components/Form';

interface Props {
    setReady: (ready: boolean) => void;
    currentThreshold: number;
    newCredentialAmount: number;
    newThreshold: number | undefined;
    setNewThreshold: (threshold: number | undefined) => void;
}

function validateThreshold(threshold: number, max: number) {
    if (!threshold) {
        return false;
    }
    if (threshold < 1) {
        return false;
    }
    return threshold <= max;
}

// TODO: Validate that the threshold is <= amount of credentials
export default function ChangeThreshold({
    setReady,
    currentThreshold,
    newCredentialAmount,
    newThreshold,
    setNewThreshold,
}: Props): JSX.Element {
    useEffect(() => {
        setReady(
            newThreshold
                ? validateThreshold(newThreshold, newCredentialAmount)
                : false
        );
    }, [setReady, newThreshold, newCredentialAmount]);

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
                        let proposedThreshold;
                        try {
                            proposedThreshold = parseInt(e.target.value, 10);
                            setNewThreshold(proposedThreshold);
                            setReady(
                                validateThreshold(
                                    proposedThreshold,
                                    newCredentialAmount
                                )
                            );
                        } catch (error) {
                            setNewThreshold(undefined);
                            setReady(false);
                        }
                    }}
                />
            </Form>
        </>
    );
}
