import React from 'react';
import { useFormContext } from 'react-hook-form';
import { displayRestakeEarnings } from '~/utils/transactionFlows/configureBaker';
import Form from './Form';

interface Props {
    fieldName: string;
    initial?: boolean;
    existing?: boolean;
}

export default function PickBakerRestake({
    fieldName,
    initial = true,
    existing,
}: Props) {
    const form = useFormContext();

    if (!form) {
        throw new Error('Must be included in a <Form />');
    }

    return (
        <>
            {existing !== undefined && (
                <div className="body3 mono mB10">
                    Current option: {displayRestakeEarnings(existing)}
                </div>
            )}
            <Form.Radios
                name={fieldName}
                defaultValue={initial}
                options={[
                    {
                        label: 'Yes, restake',
                        value: true,
                    },
                    {
                        label: "No, don't restake",
                        value: false,
                    },
                ]}
            />
        </>
    );
}
