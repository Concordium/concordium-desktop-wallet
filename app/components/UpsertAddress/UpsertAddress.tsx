import React, {
    ElementType,
    PropsWithChildren,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { SubmitHandler, Validate } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { AccountAddress } from '@concordium/web-sdk';

import {
    AddressBookEntry,
    EqualRecord,
    NotOptional,
    PolymorphicComponentProps,
} from '~/utils/types';
import { commonAddressValidators } from '~/utils/accountHelpers';
import {
    addressBookSelector,
    addToAddressBook,
    updateAddressBookEntry,
} from '~/features/AddressBookSlice';
import Modal from '~/cross-app-components/Modal';
import Button from '~/cross-app-components/Button';
import IconButton from '~/cross-app-components/IconButton';
import Card from '~/cross-app-components/Card';
import Form from '../Form';

import styles from './UpsertAddress.module.scss';
import { chosenAccountSelector } from '~/features/AccountSlice';

type Props = PropsWithChildren<{
    initialValues?: AddressBookEntryForm;
    readOnly?: boolean;
    allowAlias?: boolean;
    onSubmit?(entry: AddressBookEntry): void;
}>;

type UpsertAddressProps<
    TAs extends ElementType = typeof Button
> = PolymorphicComponentProps<TAs, Props>;

type AddressBookEntryForm = Omit<AddressBookEntry, 'readOnly'>;

const fieldNames: NotOptional<EqualRecord<AddressBookEntryForm>> = {
    name: 'name',
    address: 'address',
    note: 'note',
};

const noteMaxLength = 100;

export default function UpsertAddress<
    TAs extends ElementType = typeof IconButton
>({
    onSubmit,
    initialValues,
    readOnly = false,
    allowAlias = true,
    as,
    ...asProps
}: UpsertAddressProps<TAs>) {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const entries = useSelector(addressBookSelector);
    const account = useSelector(chosenAccountSelector);

    const isEditMode = initialValues !== undefined;
    const header = useMemo(
        () => (isEditMode ? 'Edit recipient' : 'Add new recipient'),
        [isEditMode]
    );

    const As = as || IconButton;

    const upsertAddress = useCallback(
        async (values: AddressBookEntryForm) => {
            const entry: AddressBookEntry = { ...values, readOnly };

            if (isEditMode && initialValues) {
                return updateAddressBookEntry(
                    dispatch,
                    initialValues.address,
                    entry
                );
            }
            return addToAddressBook(dispatch, entry);
        },
        [isEditMode, initialValues, dispatch, readOnly]
    );

    const addressNotAlias: Validate = useCallback(
        (address: string) => {
            if (!allowAlias && account) {
                const accountAddress = AccountAddress.fromBase58(
                    account.address
                );
                return (
                    !AccountAddress.isAlias(
                        accountAddress,
                        AccountAddress.fromBase58(address)
                    ) ||
                    'The recipient should not be an alias of the sending account.'
                );
            }
            return true;
        },
        [account, allowAlias]
    );

    const addressUnique: Validate = useCallback(
        (address: string) => {
            if (address === initialValues?.address) {
                return true;
            }

            const existing = entries.find((e) => e.address === address);

            return (
                !existing ||
                `Address already exists under name: ${existing.name}`
            );
        },
        [entries, initialValues]
    );

    const handleSubmit: SubmitHandler<AddressBookEntryForm> = useCallback(
        async (values) => {
            await upsertAddress(values);

            if (onSubmit) {
                onSubmit({ ...values, readOnly });
            }
            setOpen(false);
        },
        [onSubmit, setOpen, upsertAddress, readOnly]
    );

    return (
        <Modal
            trigger={<As {...asProps} />}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            <h2 className={styles.header}>{header}</h2>
            <Form<AddressBookEntryForm> onSubmit={handleSubmit}>
                <Card className={styles.card}>
                    <div className={styles.content}>
                        <Form.Input
                            className={styles.name}
                            name={fieldNames.name}
                            rules={{
                                required: 'Name required',
                                maxLength: {
                                    value: 40,
                                    message:
                                        'Name cannot exceed 40 characters.',
                                },
                            }}
                            placeholder="Recipient name"
                            defaultValue={initialValues?.name}
                            readOnly={readOnly}
                        />
                        <Form.TextArea
                            className={styles.input}
                            name={fieldNames.address}
                            spellCheck="false"
                            rules={{
                                required: 'Address required',
                                ...commonAddressValidators,
                                validate: {
                                    ...commonAddressValidators.validate,
                                    addressUnique,
                                    addressNotAlias,
                                },
                            }}
                            placeholder="Paste the account address here"
                            defaultValue={initialValues?.address}
                            readOnly={readOnly}
                        />
                        <Form.TextArea
                            className={styles.input}
                            name={fieldNames.note}
                            label={<span className="h3">Notes</span>}
                            rules={{
                                maxLength: {
                                    value: noteMaxLength,
                                    message: `Message cannot be longer than ${noteMaxLength} characters`,
                                },
                            }}
                            placeholder="You can add a note here"
                            defaultValue={initialValues?.note}
                        />
                    </div>
                </Card>
                <Form.Submit className={styles.submit}>
                    Save recipient
                </Form.Submit>
            </Form>
        </Modal>
    );
}
