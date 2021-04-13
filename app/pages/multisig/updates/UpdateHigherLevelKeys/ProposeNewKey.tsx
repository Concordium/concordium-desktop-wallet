import React from 'react';
import DragAndDropFile from '~/components/DragAndDropFile';
import Button from '~/cross-app-components/Button';
// import { PublicKeyExportFormat } from '../../ExportKeyView/ExportKeyView';

async function fileProcessor(rawData: Buffer) {
    JSON.parse(rawData.toString('utf-8'));

    // TODO Validate the signature on the public-key here.
    // TODO Add the key to the list of keys, if it is not already there.
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
            <Button onClick={() => {}}>Continue</Button>
        </>
    );
}
