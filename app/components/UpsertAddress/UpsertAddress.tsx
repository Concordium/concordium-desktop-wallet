import React, {
    ComponentType,
    PropsWithChildren,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Modal } from 'semantic-ui-react';
import { SubmitHandler } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { AddressBookEntry, EqualRecord, NotOptional } from '../../utils/types';
import { isValidAddress } from '../../utils/accountHelpers';
import Form from '../Form';

import styles from './UpsertAddress.module.scss';
import {
    addToAddressBook,
    updateAddressBookEntry,
} from '../../features/AddressBookSlice';

type Props<TAsProps> = Omit<TAsProps, 'onClick' | 'children'> & {
    as: ComponentType<TAsProps>;
    initialValues?: AddressBookEntryForm;
    onSubmit?(name: string, address: string, note?: string): void;
};

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
}: PropsWithChildren<Props<TAsProps>>) {
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
            closeIcon
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trigger={<As {...(asProps as any)} />}
            dimmer="blurring"
            closeOnDimmerClick={false}
        >
            <Modal.Header>{header}</Modal.Header>
            <Form<AddressBookEntryForm>
                onSubmit={handleSubmit}
                className={styles.content}
            >
                <Form.Input
                    className={styles.name}
                    name={fieldNames.name}
                    rules={{ required: 'Name required' }}
                    placeholder="Recipient Name"
                    defaultValue={initialValues?.name}
                />
                <Form.TextArea
                    className={styles.address}
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
                />
                <Form.Input
                    className={styles.input}
                    name={fieldNames.note}
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
                <button type="submit">Submit</button>
            </Form>
        </Modal>
    );
}
