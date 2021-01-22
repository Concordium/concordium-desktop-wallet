import React from 'react';
import { Button, Header, Icon, Segment } from 'semantic-ui-react';
import { openFile } from '../utils/FileHelper';

interface Props {
    text: string;
    fileProcessor: (string) => void;
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
            // Unable to load the file.
            // TODO Display that there was an error to the user.
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
