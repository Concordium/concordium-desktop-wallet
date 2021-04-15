import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import DragAndDropFile from '~/components/DragAndDropFile';
import Button from '~/cross-app-components/Button';
import { PublicKeyExportFormat } from '../../ExportKeyView/ExportKeyView';
import { UpdateType } from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';

interface Props {
    type: UpdateType;
    addKey: (publicKey: PublicKeyExportFormat) => void;
}

// TODO Check if the loaded key is already present in the update already, and show
// an error modal if that is the case.

/**
 * Component that allows the user to import a file that contains
 * a higher level governance key that should be added to the proposal.
 */
export default function ProposeNewKey({ type, addKey }: Props) {
    const dispatch = useDispatch();

    async function fileProcessor(rawData: Buffer) {
        const publicKey: PublicKeyExportFormat = JSON.parse(
            rawData.toString('utf-8')
        );
        addKey(publicKey);
    }

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
            <Button
                onClick={() =>
                    dispatch(push(`${createProposalRoute(type)}/keysetsize`))
                }
            >
                Continue
            </Button>
        </>
    );
}
