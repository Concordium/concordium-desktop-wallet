import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import { chosenAccountInfoSelector } from '~/features/AccountSlice';
import { AddressBookEntry } from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import Button from '~/cross-app-components/Button';
import Form from '~/components/Form';
import styles from './Transfers.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { validateAmount } from '~/utils/transactionHelpers';

interface Props {
    recipient?: AddressBookEntry | undefined;
    defaultAmount: string;
    header: string;
    estimatedFee?: bigint | undefined;
    toPickRecipient?(currentAmount: string): void;
    toConfirmTransfer(amount: string): void;
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
    estimatedFee,
    defaultAmount,
    toPickRecipient,
    toConfirmTransfer,
}: Props) {
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const form = useForm<PickAmountForm>({ mode: 'onTouched' });

    const handleSubmit: SubmitHandler<PickAmountForm> = useCallback(
        (values) => {
            const { amount } = values;
            toConfirmTransfer(amount);
        },
        [toConfirmTransfer]
    );

    function validate(amount: string) {
        return validateAmount(amount, accountInfo, estimatedFee);
    }

    return (
        <>
            <h2 className={styles.header}>{header}</h2>
            <Form formMethods={form} onSubmit={handleSubmit}>
                <div className={styles.pickAmount}>
                    <p>{getGTUSymbol()}</p>
                    <Form.Input
                        name="amount"
                        placeholder="Enter Amount"
                        defaultValue={defaultAmount}
                        rules={{
                            required: 'Amount Required',
                            validate: {
                                validate,
                            },
                        }}
                    />
                    <DisplayEstimatedFee
                        className={styles.estimatedFee}
                        estimatedFee={estimatedFee}
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
                            className={styles.button}
                            error={Boolean(form.errors?.recipient)}
                            onClick={() => {
                                toPickRecipient(form.getValues('amount'));
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

                <Form.Submit as={Button} className={styles.button} size="huge">
                    Continue
                </Form.Submit>
            </Form>
        </>
    );
}
