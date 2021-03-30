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
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

interface Props {
    recipient?: AddressBookEntry | undefined;
    defaultAmount: string;
    header: string;
    estimatedFee?: bigint | undefined;
    toPickRecipient?(currentAmount: string): void;
    toConfirmTransfer(amount: string): void;
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
    estimatedFee,
    defaultAmount,
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
            const { amount } = values;
            toConfirmTransfer(amount);
        },
        [toConfirmTransfer]
    );

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
                                validateAmount,
                            },
                        }}
                    />
                </div>
                <DisplayEstimatedFee estimatedFee={estimatedFee} />
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
