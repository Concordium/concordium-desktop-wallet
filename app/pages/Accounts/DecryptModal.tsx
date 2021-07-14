import React from 'react';
import Button from '~/cross-app-components/Button';
import Modal from '~/cross-app-components/Modal';
import { Account } from '~/utils/types';
import { noOp } from '~/utils/basicHelpers';
import DecryptComponent from './DecryptComponent';

export interface DecryptModalInput {
    show: boolean;
    header?: string;
    account?: Account;
    onFinish?: (decrypted: boolean) => void;
}

/**
 * A simple modal to be used for displaying simple errors, where there is no
 * action performed when user presses the button other than hiding the modal.
 */
export default function DecryptModal({
    show,
    account,
    header,
    onFinish = noOp,
}: DecryptModalInput) {
    return (
        <Modal open={show} disableClose>
            <h2>{header}</h2>
            {account && (
                <DecryptComponent
                    account={account}
                    onDecrypt={() => onFinish(true)}
                />
            )}
            <Button className="mT40" onClick={() => onFinish(false)}>
                Skip
            </Button>
        </Modal>
    );
}
