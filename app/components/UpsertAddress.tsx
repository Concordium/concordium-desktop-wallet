import React, { ComponentProps, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'semantic-ui-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

import { AddressBookEntry, EqualRecord, NotOptional } from '../utils/types';
import { isValidAddress } from '../utils/accountHelpers';

interface Props
    extends Pick<NotOptional<ComponentProps<typeof Modal>>, 'trigger'> {
    submit(name: string, address: string, note?: string): void;
    initialValues?: AddressBookEntryForm;
}

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

export default function UpsertAddress({
    submit,
    initialValues,
    trigger,
}: Props) {
    const [open, setOpen] = useState(false);

    const isEditMode = initialValues !== undefined;
    const header = useMemo(
        () => (isEditMode ? 'Edit recipient' : 'Add new recipient'),
        [isEditMode]
    );
    const defaultValues: AddressBookEntryForm = useMemo(
        () => ({
            address: '',
            name: '',
            note: '',
            ...initialValues,
        }),
        [initialValues]
    );

    const { handleSubmit, errors, control } = useForm<AddressBookEntryForm>({
        defaultValues,
        mode: 'onTouched',
    });

    const onSubmit: SubmitHandler<AddressBookEntry> = ({
        address,
        name,
        note,
    }) => {
        submit(name, address, note);
        setOpen(false);
    };

    return (
        <Modal
            closeIcon
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={trigger}
            dimmer="blurring"
            closeOnDimmerClick={false}
        >
            <Modal.Header>{header}</Modal.Header>
            <Modal.Content>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name={fieldNames.name}
                        control={control}
                        rules={{ required: 'Name required' }}
                        render={({ ref, ...p }) => (
                            <Form.Input
                                {...p}
                                placeholder="Recipient Name"
                                error={errors.name?.message}
                            />
                        )}
                    />
                    <Controller
                        name={fieldNames.address}
                        control={control}
                        rules={{
                            required: 'Address should be 50 characters',
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
                        render={({ ref, ...p }) => (
                            <Form.Input
                                {...p}
                                placeholder="Paste the account address here"
                                error={errors.address?.message}
                            />
                        )}
                    />
                    <Controller
                        name={fieldNames.note}
                        control={control}
                        rules={{
                            maxLength: {
                                value: noteMaxLength,
                                message:
                                    'Message cannot be longer than 255 characters',
                            },
                        }}
                        render={({ ref, ...p }) => (
                            <Form.Input
                                {...p}
                                value={(p.value as string)?.substring(
                                    0,
                                    noteMaxLength - 1
                                )}
                                label="Notes"
                                placeholder="You can add a note here"
                                error={errors.note?.message}
                            />
                        )}
                    />
                    <Button positive type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Content>
        </Modal>
    );
}
