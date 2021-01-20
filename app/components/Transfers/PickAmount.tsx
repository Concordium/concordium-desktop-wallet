import React from 'react';
import { Card, Input, Button } from 'semantic-ui-react';
import { AddressBookEntry } from '../../utils/types';
import locations from '../../constants/transferLocations.json';

interface Props {
    setLocation(location: string): void;
    recipient: AddressBookEntry;
    amount: string;
    setAmount(amount: string): void;
}

export default function PickAmount({
    setLocation,
    recipient,
    amount,
    setAmount,
}: Props) {
    function updateAmount(newAmount) {
        /// Checks that the input is a number and that it does not split micro units
        if (!Number.isNaN(newAmount) && Number.isInteger(newAmount * 1000000)) {
            setAmount(newAmount);
        }
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Transfer Amount</Card.Header>
                <Input
                    fluid
                    name="name"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => updateAmount(e.target.value)}
                    autoFocus
                />
                <Button.Group vertical>
                    <Button
                        onClick={() => setLocation(locations.pickRecipient)}
                    >
                        {' '}
                        {recipient ? recipient.name : 'Select Recipient'}{' '}
                    </Button>
                    <Button
                        positive
                        onClick={() => setLocation(locations.confirmTransfer)}
                        disabled={!recipient}
                    >
                        Continue
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
