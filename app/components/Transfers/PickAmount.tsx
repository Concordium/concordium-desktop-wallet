import React from 'react';
import { Card, Input, Button } from 'semantic-ui-react';
import { AddressBookEntry } from '../../utils/types';
import locations from '../../constants/transferLocations.json';
import { getGTUSymbol, isValidGTUString } from '../../utils/gtu';

interface Props {
    setLocation(location: string): void;
    recipient: AddressBookEntry;
    amount: string;
    setAmount(amount: string): void;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
 * TODO: Rework structure to simplify this component?
 * TODO: Add an error label, describing the issue (on debounce);
 */
export default function PickAmount({
    setLocation,
    recipient,
    amount,
    setAmount,
}: Props) {
    const validInput = isValidGTUString(amount);

    function updateAmount(newAmount) {
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
                        onClick={() => setLocation(locations.pickRecipient)}
                    >
                        {recipient ? recipient.name : 'Select Recipient'}
                    </Button>
                    <Button
                        positive
                        onClick={() => setLocation(locations.confirmTransfer)}
                        disabled={!recipient || !validInput}
                    >
                        Continue
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
