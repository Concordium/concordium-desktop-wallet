import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChoiceModal, { Action } from '~/components/ChoiceModal';
import {
    updateSettingEntry,
    showMemoWarningSelector,
} from '~/features/SettingsSlice';

interface Props {
    open: boolean;
}

export default function MemoWarning({ open }: Props) {
    const dispatch = useDispatch();
    const [alreadyOpened, setAlreadyOpened] = useState<boolean>(false);
    const showMemoWarning = useSelector(showMemoWarningSelector);

    if (showMemoWarning?.value !== '1') {
        return null;
    }

    const actions: Action[] = [
        {
            label: 'Don’t show again',
            onPicked: () =>
                updateSettingEntry(dispatch, {
                    ...showMemoWarning,
                    value: '0',
                }),
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
            description="Transaction messages are public and visible to everyone on the blockchain. Any message sent with a transaction are permament, and will be visible forever, so be careful what you write in the message.

        Adding a message will increase the transaction fee."
            actions={actions}
            open={!alreadyOpened && open}
            postAction={() => setAlreadyOpened(true)}
        />
    );
}
