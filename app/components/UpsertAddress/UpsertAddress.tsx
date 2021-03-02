import React, {
    PropsWithChildren,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import {
    AddressBookEntry,
    EqualRecord,
    NotOptional,
    WithAsPropOmit,
} from '../../utils/types';
import { isValidAddress } from '../../utils/accountHelpers';
import {
    addToAddressBook,
    updateAddressBookEntry,
} from '../../features/AddressBookSlice';
import Form from '../Form';

import styles from './UpsertAddress.module.scss';
import Modal from '../../cross-app-components/Modal';

interface HasOnClick {
    onClick?(): void;
}

type Props<TAsProps extends HasOnClick> = WithAsPropOmit<TAsProps, 'onClick'> &
    PropsWithChildren<{
        initialValues?: AddressBookEntryForm;
        onSubmit?(name: string, address: string, note?: string): void;
    }>;

type AddressBookEntryForm = Omit<AddressBookEntry, 'readOnly'>;

const fieldNames: NotOptional<EqualRecord<AddressBookEntryForm>> = {
    name: 'name',
    address: 'address',
    note: 'note',
};

const noteMaxLength = 255;

function validateAddress(v: string): string | undefined {
    if (isValidAddress(v)) {
        return undefined;
    }
    return 'Address format is invalid';
}

export default function UpsertAddress<TAsProps>({
    onSubmit,
    initialValues,
    as: As,
    ...asProps
}: Props<TAsProps>) {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const isEditMode = initialValues !== undefined;
    const header = useMemo(
        () => (isEditMode ? 'Edit recipient' : 'Add new recipient'),
        [isEditMode]
    );

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trigger={<As {...(asProps as any)} />}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
        >
            <h2 className={styles.header}>{header}</h2>
            <Form<AddressBookEntryForm> onSubmit={handleSubmit}>
                <div className={styles.card}>
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
                </div>
                <Form.Submit className={styles.submit}>
                    Save recipient
                </Form.Submit>
            </Form>
        </Modal>
    );
}
