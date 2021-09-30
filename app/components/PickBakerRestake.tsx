import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import ButtonGroup from './ButtonGroup';

interface Props {
    fieldName: string;
}

export default function PickBakerRestake({ fieldName }: Props) {
    const form = useFormContext();

    if (!form) {
        throw new Error('Must be included in a <Form />');
    }

    return (
        <Controller
            name={fieldName}
            // eslint-disable-next-line react/jsx-boolean-value
            defaultValue={true}
            control={form.control}
            render={(f) => (
                <ButtonGroup
                    title="Enable restake earnings"
                    name="restake"
                    buttons={[
                        {
                            label: 'Yes, restake',
                            value: true,
                        },
                        {
                            label: 'No, don’t restake',
                            value: false,
                        },
                    ]}
                    isSelected={({ value }) => value === f.value}
                    onClick={({ value }) => {
                        f.onChange(value);
                        f.onBlur();
                    }}
                />
            )}
        />
    );
}
