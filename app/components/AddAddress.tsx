import React from 'react';
import { Button, Form, Input, TextArea } from 'semantic-ui-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { AddressBookEntry } from '../utils/types';

interface Props {
    close(): void;
    submit(name: string, address: string, note?: string): void;
    initialValues?: AddressBookEntry;
}

function AddAddress({ close, submit, initialValues }: Props) {
    const { control, handleSubmit } = useForm<AddressBookEntry>({
        defaultValues: initialValues,
    });

    const onSubmit: SubmitHandler<AddressBookEntry> = ({
        address,
        name,
        note,
    }) => {
        submit(name, address, note);
        close();
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Field>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={(props) => (
                        <Input {...props} placeholder="Enter recipient name" />
                    )}
                />
            </Form.Field>
            <Form.Field>
                <Controller
                    name="address"
                    control={control}
                    rules={{ required: true }}
                    render={(props) => (
                        <Input
                            {...props}
                            placeholder="Paste the account address here"
                        />
                    )}
                />
            </Form.Field>
            <Form.Field>
                <Controller
                    name="note"
                    control={control}
                    rules={{ maxLength: 255 }}
                    render={(props) => (
                        <TextArea
                            {...props}
                            placeholder="You can add a note here"
                        />
                    )}
                />
            </Form.Field>
            <Button positive type="submit">
                Submit
            </Button>
        </Form>
    );
}

AddAddress.defaultProps = {
    initialValues: undefined,
};

export default AddAddress;
