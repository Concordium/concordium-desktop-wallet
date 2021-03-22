import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';

interface Props {
    setReady: (ready: boolean) => void;
    currentCredentialAmount: number;
    newCredentialAmount: number;
    currentThreshold: number;
    newThreshold: number | undefined;
}

/**
 *  Displays the changes in the signature threshold and the amount of credentials
 *  Allows the user to go back and change these parameters.
 */
export default function ConfirmPage({
    setReady,
    currentCredentialAmount,
    currentThreshold,
    newCredentialAmount,
    newThreshold,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    setReady(true);

    return (
        <>
            <h1>Please confirm the below information?</h1>
            <h3>
                Please confirm that the changes to the amount of credentials and
                the signature threshold for the account are correct.
            </h3>

            <h2>Amount of credentials:</h2>
            <b>
                {currentCredentialAmount} {'--->'} {newCredentialAmount}
            </b>
            <Button
                onClick={() =>
                    dispatch(
                        push(
                            routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_ADDCREDENTIAL
                        )
                    )
                }
            >
                Change
            </Button>

            <h2>Signature Threshold:</h2>
            <b>
                {currentThreshold} {'--->'} {newThreshold}
            </b>
            <Button
                onClick={() =>
                    dispatch(
                        push(
                            routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_CHANGESIGNATURETHRESHOLD
                        )
                    )
                }
            >
                Change
            </Button>
        </>
    );
}
