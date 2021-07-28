import React from 'react';
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
 * A modal that contains a decrypt component, to allow the user to decrypt the chosen account's transactions and balance.
 */
export default function DecryptModal({
    show,
    account,
    header,
    onFinish = noOp,
}: DecryptModalInput) {
    return (
        <Modal open={show} onClose={() => onFinish(false)}>
            <h2 className="mB30">{header}</h2>
            {account && (
                <DecryptComponent
                    account={account}
                    onDecrypt={() => onFinish(true)}
                />
            )}
        </Modal>
    );
}
