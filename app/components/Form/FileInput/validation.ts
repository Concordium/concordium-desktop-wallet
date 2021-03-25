/* eslint-disable import/prefer-default-export */
import { Validate } from 'react-hook-form';
import { FileInputValue } from './FileInput';
import { bytesFromKb, fileListToFileArray } from './util';

export const maxFileSizeKb = (maxKb: number, message?: string): Validate => (
    value: FileInputValue
) => {
    if (value === null) {
        return true; // Valid if null. Another validation function should check for this if field is required.
    }

    const files = fileListToFileArray(value);
    const maxBytes = bytesFromKb(maxKb);

    return !files.some((f) => f.size > maxBytes) || message || false;
};
