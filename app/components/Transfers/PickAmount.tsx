import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import { chosenAccountInfoSelector } from '~/features/AccountSlice';
import { AddressBookEntry, AccountInfo } from '~/utils/types';
import { toMicroUnits, getGTUSymbol, isValidGTUString } from '~/utils/gtu';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import Button from '~/cross-app-components/Button';
import Form from '~/components/Form';
import styles from './Transfers.module.scss';

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

interface PickAmountForm {
    amount: string;
    recipient: string;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
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
    const form = useForm<PickAmountForm>({ mode: 'onTouched' });

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

    const handleSubmit: SubmitHandler<PickAmountForm> = useCallback(
        (values) => {
            const { amount: currentAmount } = values;
            setAmount(currentAmount);
            toConfirmTransfer();
        },
        [setAmount, toConfirmTransfer]
    );

    return (
        <>
            <h2>{header}</h2>
            <Form formMethods={form} onSubmit={handleSubmit}>
                <div className={styles.pickAmount}>
                    <p>{getGTUSymbol()}</p>
                    <Form.Input
                        name="amount"
                        placeholder="Enter Amount"
                        defaultValue={amount}
                        rules={{
                            required: 'Amount Required',
                            validate: {
                                validateAmount,
                            },
                        }}
                    />
                </div>
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
                        <AddressBookEntryButton
                            error={Boolean(form.errors?.recipient)}
                            onClick={() => {
                                setAmount(form.getValues('amount'));
                                toPickRecipient();
                            }}
                        >
                            {recipient ? recipient.name : 'Select Recipient'}
                            <br />
                        </AddressBookEntryButton>
                        <p className={styles.errorLabel}>
                            {form.errors?.recipient?.message}
                        </p>
                    </>
                ) : null}
                <Form.Submit as={Button} size="huge">
                    Continue
                </Form.Submit>
            </Form>
        </>
    );
}
