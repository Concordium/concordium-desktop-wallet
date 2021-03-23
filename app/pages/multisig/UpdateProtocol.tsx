import React from 'react';
import { Validate, ValidationRule } from 'react-hook-form';
import { EqualRecord, ProtocolUpdate } from '../../utils/types';
import { isHex } from '../../utils/basicHelpers';
import Form from '~/components/Form';

// const auxiliaryDataMaxSizeKb = 2048;

export type UpdateProtocolFields = ProtocolUpdate;

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
    // const [loadedFileName, setLoadedFileName] = useState<string | undefined>();

    // function loadAuxiliaryData(auxiliaryData: Buffer, fileName: string) {
    //     if (protocolUpdate) {
    //         const updatedProtocolUpdate: ProtocolUpdate = {
    //             ...protocolUpdate,
    //             specificationAuxiliaryData: auxiliaryData.toString('base64'),
    //         };
    //         setProtocolUpdate(updatedProtocolUpdate);
    //         setLoadedFileName(fileName);
    //     }
    // }

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
            <Form.Input
                name={fieldNames.specificationAuxiliaryData}
                label="Specification Auxiliary Data:"
                placeholder="Drag file here"
                rules={{ required: 'Specification Auxiliary Data is required' }}
            />
            {/* TODO drag/drop file component */}
        </>
    );

    // return (
    //     <Segment basic textAlign="center">
    //         <Input
    //             label="Message"
    //             placeholder="Enter your message here"
    //             fluid
    //             value={protocolUpdate.message}
    //             onChange={(e) => {
    //                 const updatedProtocolUpdate = {
    //                     ...protocolUpdate,
    //                     message: e.target.value,
    //                 };
    //                 setProtocolUpdate(updatedProtocolUpdate);
    //             }}
    //         />
    //         <Divider clearing hidden />
    //         <Input
    //             label="Specification URL"
    //             placeholder="Enter specification URL here"
    //             fluid
    //             value={protocolUpdate.specificationUrl}
    //             onChange={(e) => {
    //                 const updatedProtocolUpdate = {
    //                     ...protocolUpdate,
    //                     specificationUrl: e.target.value,
    //                 };
    //                 setProtocolUpdate(updatedProtocolUpdate);
    //             }}
    //         />
    //         <Divider clearing hidden />
    //         <Input
    //             label="Specification hash"
    //             placeholder="Enter your specification hash here"
    //             fluid
    //             value={protocolUpdate.specificationHash}
    //             onChange={(e) => {
    //                 const updatedProtocolUpdate = {
    //                     ...protocolUpdate,
    //                     specificationHash: e.target.value,
    //                 };
    //                 setProtocolUpdate(updatedProtocolUpdate);
    //             }}
    //         />
    //         <Divider clearing hidden />
    //         <DragAndDropFile
    //             text="Drag and drop specification auxiliary data"
    //             fileProcessor={loadAuxiliaryData}
    //             maxSizeKb={auxiliaryDataMaxSizeKb}
    //             loadedFileName={loadedFileName}
    //         />
    //     </Segment>
    // );
}
