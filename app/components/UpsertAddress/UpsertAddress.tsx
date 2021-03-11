import React, {
    ElementType,
    PropsWithChildren,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { SubmitHandler, Validate } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import {
    AddressBookEntry,
    EqualRecord,
    NotOptional,
    PolymorphicComponentProps,
} from '../../utils/types';
import { isValidAddress } from '../../utils/accountHelpers';
import {
    addressBookSelector,
    addToAddressBook,
    updateAddressBookEntry,
} from '../../features/AddressBookSlice';
import Form from '../Form';

import styles from './UpsertAddress.module.scss';
import Modal from '../../cross-app-components/Modal';
import Button from '../../cross-app-components/Button';
import Card from '../../cross-app-components/Card';

type Props = PropsWithChildren<{
    initialValues?: AddressBookEntryForm;
    onSubmit?(name: string, address: string, note?: string): void;
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

const noteMaxLength = 255;

const validateAddressFormat: Validate = (address: string) => {
    return isValidAddress(address) || 'Address format is invalid';
};

export default function UpsertAddress<TAs extends ElementType = typeof Button>({
    onSubmit,
    initialValues,
    as,
    ...asProps
}: UpsertAddressProps<TAs>) {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const entries = useSelector(addressBookSelector);

    const isEditMode = initialValues !== undefined;
    const header = useMemo(
        () => (isEditMode ? 'Edit recipient' : 'Add new recipient'),
        [isEditMode]
    );

    const As = as || Button;

    const upsertAddress = useCallback(
        (values: AddressBookEntryForm) => {
            const entry: AddressBookEntry = { ...values, readOnly: false };

            if (isEditMode && initialValues) {
                updateAddressBookEntry(dispatch, initialValues.name, entry);
            } else {
                addToAddressBook(dispatch, entry);
            }
        },
        [isEditMode, initialValues, dispatch]
    );

    const validateAddressUnique: Validate = useCallback(
        (address: string) => {
            const existing = entries.find((e) => e.address === address);

            return (
                !existing ||
                `Address already exists under name: ${existing.name}`
            );
        },
        [entries]
    );

    const validateAddress: Validate = useCallback(
        (address: string) =>
            validateAddressFormat(address) || validateAddressUnique(address),
        [validateAddressUnique]
    );

    const handleSubmit: SubmitHandler<AddressBookEntryForm> = useCallback(
        (values) => {
            upsertAddress(values);

            const { name, address, note } = values;

            if (onSubmit) {
                onSubmit(name, address, note);
            }

            setOpen(false);
        },
        [onSubmit, setOpen, upsertAddress]
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
                            rules={{ required: 'Name required' }}
                            placeholder="Recipient Name"
                            defaultValue={initialValues?.name}
                        />
                        <Form.TextArea
                            className={styles.input}
                            name={fieldNames.address}
                            rules={{
                                required: 'Address required',
                                minLength: {
                                    value: 50,
                                    message: 'Address should be 50 characters',
                                },
                                maxLength: {
                                    value: 50,
                                    message: 'Address should be 50 characters',
                                },
                                validate: validateAddress,
                            }}
                            placeholder="Paste the account address here"
                            defaultValue={initialValues?.address}
                            autoScale
                        />
                        <Form.Input
                            className={styles.input}
                            name={fieldNames.note}
                            label={<span className="h3">Notes</span>}
                            rules={{
                                maxLength: {
                                    value: noteMaxLength,
                                    message:
                                        'Message cannot be longer than 255 characters',
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
