import React from 'react';
import { useSelector } from 'react-redux';
import { chosenAccountInfoSelector } from '~/features/AccountSlice';
import { AddressBookEntry, AccountInfo } from '~/utils/types';
import { toMicroUnits, getGTUSymbol, isValidGTUString } from '~/utils/gtu';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import Button from '~/cross-app-components/Button';
import Form from '~/components/Form';

interface Props {
    recipient?: AddressBookEntry | undefined;
    amount: string;
    header: string;
    setAmount(amount: string): void;
    toPickRecipient?(): void;
    toConfirmTransfer(): void;
}

// TODO: Take staked amount into consideration
function atDisposal(accountInfo: AccountInfo): bigint {
    const unShielded = BigInt(accountInfo.accountAmount);
    const scheduled = accountInfo.accountReleaseSchedule
        ? BigInt(accountInfo.accountReleaseSchedule.total)
        : 0n;
    return unShielded - scheduled;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
 * TODO: Find a way to display the recipient check, without showing a dummy checkbox;
 */
export default function PickAmount({
    recipient,
    header,
    amount,
    setAmount,
    toPickRecipient,
    toConfirmTransfer,
}: Props) {
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const fee = 5900n; // TODO: Add cost calculator

    function validateAmount(amountToValidate: string): string | undefined {
        if (!isValidGTUString(amountToValidate)) {
            return 'Invalid input';
        }
        if (
            accountInfo &&
            atDisposal(accountInfo) < toMicroUnits(amountToValidate) + fee
        ) {
            return 'Insufficient funds';
        }
        return undefined;
    }

    return (
        <>
            <h2>{header}</h2>
            <Form onSubmit={toConfirmTransfer}>
                <Form.Input
                    name="name"
                    placeholder="Enter Amount"
                    label={getGTUSymbol()}
                    value={amount}
                    rules={{
                        required: 'Amount Required',
                        validate: {
                            validateAmount,
                        },
                    }}
                    onChange={(e) => {
                        const newAmount = e.target.value;
                        setAmount(newAmount);
                    }}
                />
                {toPickRecipient ? (
                    <>
                        <div style={{ display: 'none' }}>
                            <Form.Checkbox
                                name="recipient"
                                rules={{
                                    required: 'Recipient Required',
                                }}
                                checked={Boolean(recipient?.address)}
                            />
                        </div>
                        <AddressBookEntryButton onClick={toPickRecipient}>
                            {recipient ? recipient.name : 'Select Recipient'}
                        </AddressBookEntryButton>
                    </>
                ) : null}
                <Form.Submit as={Button} size="huge">
                    Continue
                </Form.Submit>
            </Form>
        </>
    );
}
