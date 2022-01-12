import React from 'react';
import { useFormContext } from 'react-hook-form';
import Form from './Form';

interface Props {
    fieldName: string;
    initial?: boolean;
}

export default function PickBakerRestake({ fieldName, initial = true }: Props) {
    const form = useFormContext();

    if (!form) {
        throw new Error('Must be included in a <Form />');
    }

    return (
        <Form.Radios
            name={fieldName}
            defaultValue={initial}
            options={[
                {
                    label: 'Yes, restake',
                    value: true,
                },
                {
                    label: 'No, don’t restake',
                    value: false,
                },
            ]}
        />
    );
}
