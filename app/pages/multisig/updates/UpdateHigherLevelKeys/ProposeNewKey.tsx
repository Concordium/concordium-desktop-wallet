import React from 'react';
import DragAndDropFile from '~/components/DragAndDropFile';

async function fileProcessor(rawData: Buffer) {
    if (rawData) {
        let encryptedData;
        try {
            encryptedData = JSON.parse(rawData.toString('utf-8'));
        } catch (e) {
            fail('This file is not a valid Export File!');
            return;
        }
        const validation = validateEncryptedStructure(encryptedData);
        if (!validation.isValid) {
            fail(`This file is invalid due to: ${validation.reason}`);
        } else {
            setFile(encryptedData);
            setPasswordModalOpen(true);
        }
    }
}

export default function ProposeNewKey() {
    return (
        <>
            <div>
                <h2>Do you want to propose a new key?</h2>
                <p>
                    You can add a new key by dropping it below. If you do not
                    want to make changes to the keys, then you can continue to
                    change the signature threshold.
                </p>
                <DragAndDropFile
                    text="Drag and drop key file here"
                    fileProcessor={fileProcessor}
                />
            </div>
        </>
    );
}
