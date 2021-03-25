import React from 'react';
import { Card, Input, Button } from 'semantic-ui-react';
import { AddressBookEntry } from '~/utils/types';
import { getGTUSymbol, isValidGTUString } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

interface Props {
    recipient?: AddressBookEntry | undefined;
    amount: string;
    header: string;
    setAmount(amount: string): void;
    estimatedFee?: bigint | undefined;
    toPickRecipient?(): void;
    toConfirmTransfer(): void;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
 * TODO: Rework structure to simplify this component?
 * TODO: Add an error label, describing the issue (on debounce);
 */
export default function PickAmount({
    recipient,
    header,
    amount,
    estimatedFee,
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
                <Card.Header content={header} />
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
                <DisplayEstimatedFee estimatedFee={estimatedFee} />
                <Button.Group vertical>
                    {toPickRecipient ? (
                        <Button onClick={toPickRecipient}>
                            {recipient ? recipient.name : 'Select Recipient'}
                        </Button>
                    ) : null}
                    <Button
                        positive
                        onClick={toConfirmTransfer}
                        disabled={
                            (!recipient && toPickRecipient !== undefined) ||
                            !validInput
                        }
                    >
                        Continue
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
