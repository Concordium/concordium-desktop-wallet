import React from 'react';
import { Input } from 'semantic-ui-react';

interface Props {
    placeholder: string;
    value: number;
    setValue(timestamp: number): void;
}

// A component that allows the user to enter a time stamp.
// TODO convert to YYYY - MM - DD at HH - MM - SS format.
export default function InputTimeStamp({
    placeholder,
    value,
    setValue,
}: Props) {
    return (
        <Input
            fluid
            name="timestamp"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            autoFocus
            type="number"
        />
    );
}
