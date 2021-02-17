import React from 'react';
import { Card, Input, Button } from 'semantic-ui-react';
import { AddressBookEntry } from '../../utils/types';
import { getGTUSymbol, isValidGTUString } from '../../utils/gtu';

interface Props {
    recipient: AddressBookEntry | undefined;
    amount: string;
    setAmount(amount: string): void;
    toPickRecipient(): void;
    toConfirmTransfer(): void;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
 * TODO: Rework structure to simplify this component?
 * TODO: Add an error label, describing the issue (on debounce);
 */
export default function PickAmount({
    recipient,
    amount,
    setAmount,
    toPickRecipient,
    toConfirmTransfer,
}: Props) {
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
                    <Button onClick={toPickRecipient}>
                        {recipient ? recipient.name : 'Select Recipient'}
                    </Button>
                    <Button
                        positive
                        onClick={toConfirmTransfer}
                        disabled={!recipient || !validInput}
                    >
                        Continue
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
