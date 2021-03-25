import React from 'react';
import { Validate, ValidationRule } from 'react-hook-form';
import { EqualRecord, ProtocolUpdate } from '../../utils/types';
import { isHex } from '../../utils/basicHelpers';
import Form from '~/components/Form';
import { maxFileSizeKb } from '~/components/Form/FileInput/validation';

const auxiliaryDataMaxSizeKb = 2048;

export interface UpdateProtocolFields
    extends Omit<ProtocolUpdate, 'specificationAuxiliaryData'> {
    specificationAuxiliaryData: FileList;
}

const fieldNames: EqualRecord<UpdateProtocolFields> = {
    message: 'message',
    specificationUrl: 'specificationUrl',
    specificationHash: 'specificationHash',
    specificationAuxiliaryData: 'specificationAuxiliaryData',
};

const lengthRule: ValidationRule<number> = {
    value: 64,
    message: 'Specification hash must be 64 characters',
};

const validateHex: Validate = (v: string) =>
    isHex(v) || 'Specification hash must be HEX format';

/**
 * Component for creating an update protocol transaction.
 */
export default function UpdateProtocol(): JSX.Element | null {
    return (
        <>
            <Form.TextArea
                name={fieldNames.message}
                label="Message:"
                placeholder="Enter you message here"
                rules={{ required: 'Message is required' }}
            />
            <Form.Input
                name={fieldNames.specificationUrl}
                label="Specification URL:"
                placeholder="Enter specification URL"
                rules={{ required: 'Specification URL is required' }}
            />
            <Form.TextArea
                name={fieldNames.specificationHash}
                label="Specification Hash:"
                placeholder="Paste specification hash here"
                rules={{
                    required: 'Specification hash is required',
                    minLength: lengthRule,
                    maxLength: lengthRule,
                    validate: validateHex,
                }}
            />
            <Form.File
                name={fieldNames.specificationAuxiliaryData}
                label="Specification Auxiliary Data:"
                placeholder="No file chosen"
                rules={{
                    required: 'Specification Auxiliary Data is required',
                    validate: maxFileSizeKb(
                        auxiliaryDataMaxSizeKb,
                        `File size too big (max: ${auxiliaryDataMaxSizeKb}kb)`
                    ),
                }}
            />
        </>
    );
}
