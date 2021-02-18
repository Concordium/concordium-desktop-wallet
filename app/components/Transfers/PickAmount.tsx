import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Card, Input, Button } from 'semantic-ui-react';
import { AddressBookEntry } from '../../utils/types';
import { getGTUSymbol, isValidGTUString } from '../../utils/gtu';
import routes from '../../constants/routes.json';

interface Props {
    recipient: AddressBookEntry | undefined;
    amount: string;
    setAmount(amount: string): void;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
 * TODO: Rework structure to simplify this component?
 * TODO: Add an error label, describing the issue (on debounce);
 */
export default function PickAmount({ recipient, amount, setAmount }: Props) {
    const dispatch = useDispatch();
    const validInput = isValidGTUString(amount);

    function updateAmount(newAmount: string) {
        setAmount(newAmount);
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Transfer Amount</Card.Header>
                <Input
                    fluid
                    name="name"
                    placeholder="Enter Amount"
                    error={!validInput}
                    value={amount}
                    onChange={(e) => updateAmount(e.target.value)}
                    autoFocus
                    label={{ basic: true, content: getGTUSymbol() }}
                />
                <Button.Group vertical>
                    <Button
                        onClick={() =>
                            dispatch(
                                push(
                                    routes.ACCOUNTS_SIMPLETRANSFER_PICKRECIPIENT
                                )
                            )
                        }
                    >
                        {recipient ? recipient.name : 'Select Recipient'}
                    </Button>
                    <Button
                        positive
                        onClick={() =>
                            dispatch(
                                push(
                                    routes.ACCOUNTS_SIMPLETRANSFER_CONFIRMTRANSFER
                                )
                            )
                        }
                        disabled={!recipient || !validInput}
                    >
                        Continue
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
