import React from 'react';
import { Modal } from 'semantic-ui-react';

export interface ModalErrorInput {
    show: boolean;
    header?: string;
    content?: string;
}

interface Props extends ModalErrorInput {
    onClick: () => void;
}

/**
 * A simple modal to be used for displaying simple errors, where there is no
 * action performed when user presses the button other than hiding the modal.
 */
export default function SimpleErrorModal({
    show,
    header,
    content,
    onClick,
}: Props) {
    return (
        <Modal
            open={show}
            header={header}
            content={content}
            actions={[
                {
                    key: 'okay',
                    content: 'Okay',
                    positive: true,
                    onClick: () => onClick(),
                },
            ]}
        />
    );
}
