import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChoiceModal, { Action, LocationAction } from '~/components/ChoiceModal';
import {
    updateSettingEntry,
    showMemoWarningSelector,
} from '~/features/SettingsSlice';

interface Props {
    open: boolean;
    onClose: () => void;
}

/**
 *  Modal to warn/inform the user about memos.
 *  If the showMemoWarning setting is off, the modal will never appear;
 */
export default function MemoWarning({ open, onClose }: Props) {
    const dispatch = useDispatch();
    const showMemoWarning = useSelector(showMemoWarningSelector);

    if (showMemoWarning?.value !== '1') {
        return null;
    }

    const actions: [Action, LocationAction] = [
        {
            label: 'Don’t show again',
            action() {
                updateSettingEntry(dispatch, {
                    ...showMemoWarning,
                    value: '0',
                });
            },
            inverted: true,
        },
        {
            label: 'Okay',
        },
    ];
    return (
        <ChoiceModal
            disableClose
            title="Transaction memos"
            description="Transaction memos are public and visible to everyone on the blockchain. Any memo sent with a transaction is permament, and will be visible forever, so be careful what you write in the memo.

        Adding a memo will increase the transaction fee."
            actions={actions}
            open={open}
            postAction={onClose}
        />
    );
}
