import React, { useState } from 'react';
import { Button, Divider, Header, Icon, Segment } from 'semantic-ui-react';
import { openFileRaw } from '../utils/FileHelper';
import SimpleErrorModal from './SimpleErrorModal';

// TODO Add support for actual drag&drop functionality.

interface Props {
    text: string;
    fileProcessor: (fileContents: Buffer) => void;
    disabled?: boolean;
    maxSizeKb?: number;
}

/**
 * Component for loading files from the file system, either by using a button to open a file
 * dialogue or by drag&dropping a file onto the component. An optional max size for the file
 * to be loaded can be added to restrict file sizes.
 */
export default function DragAndDropFile({
    text,
    fileProcessor,
    disabled,
    maxSizeKb,
}: Props) {
    const [showError, setShowError] = useState(false);

    let maxSizeItem = null;
    let maxSizeAsBytes: number | undefined;
    if (maxSizeKb) {
        maxSizeAsBytes = maxSizeKb * 1024;
        maxSizeItem = (
            <>
                <Divider horizontal />
                Max file size: {maxSizeKb}KB
            </>
        );
    }

    async function loadFile() {
        let file: Buffer;
        try {
            file = await openFileRaw('Open file');
            if (maxSizeAsBytes && file.length > maxSizeAsBytes) {
                setShowError(true);
                return;
            }
            fileProcessor(file);
        } catch (err) {
            // An error is thrown if the user cancels the open file menu, or if
            // no file was selected. Therefore this error can be ignored, as nothing
            // should happen.
        }
    }

    return (
        <>
            <SimpleErrorModal
                header="File is too large"
                content={`The selected file exceeds the max size of ${maxSizeKb}KB`}
                show={showError}
                onClick={() => setShowError(false)}
            />
            <Segment placeholder>
                <Header icon>
                    <Icon name="file" />
                    {text}
                    {maxSizeItem}
                </Header>
                <Button primary onClick={loadFile} disabled={disabled}>
                    Or browse to file
                </Button>
            </Segment>
        </>
    );
}

DragAndDropFile.defaultProps = {
    disabled: false,
    maxSizeKb: undefined,
};
