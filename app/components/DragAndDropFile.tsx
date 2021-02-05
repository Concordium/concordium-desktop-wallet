import React from 'react';
import { Button, Header, Icon, Segment } from 'semantic-ui-react';
import { openFile } from '../utils/FileHelper';

// TODO Add support for actual drag&drop functionality.

interface Props {
    text: string;
    fileProcessor: (fileContents: string) => void;
    disabled?: boolean;
}

export default function DragAndDropFile({
    text,
    fileProcessor,
    disabled,
}: Props) {
    async function loadFile() {
        let transactionString;
        try {
            transactionString = await openFile('Open file');
            fileProcessor(transactionString);
        } catch (err) {
            // An error is thrown if the user cancels the open file menu, or if
            // no file was selected. Therefore this error can be ignored, as nothing
            // should happen.
        }
    }

    return (
        <Segment placeholder>
            <Header icon>
                <Icon name="file" />
                {text}
            </Header>
            <Button primary onClick={loadFile} disabled={disabled}>
                Or browse to file
            </Button>
        </Segment>
    );
}

DragAndDropFile.defaultProps = {
    disabled: false,
};
