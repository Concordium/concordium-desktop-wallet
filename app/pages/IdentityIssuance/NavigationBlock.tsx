import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Location } from 'history';
import { Prompt } from 'react-router-dom';

interface Props {
    shouldPrompt: (location: Location) => boolean;
}

const message = 'You are about to abort creating an identity. Are you sure?';

/**
 * This Component is used to block navigation away from the identity issuance flow.
 * Uses Prompt to block navigation, and eletron's own messageBox to prompt the user.
 */
export default function BlockingPage({ shouldPrompt }: Props) {
    const [blocking, setBlocking] = useState(true);
    const dispatch = useDispatch();

    const showPrompt = useCallback(
        async (location: Location) => {
            setBlocking(false);
            const { response } = await window.messageBox({
                message,
                type: 'warning',
                noLink: true,
                buttons: ['abort', 'cancel'],
            });
            if (response === 0) {
                // 0 = abort, because the response is the index of the pressed button.
                dispatch(push(location));
            } else {
                setBlocking(true);
            }
        },
        [message]
    );

    const handleNavigation = (nLocation: Location) => {
        if (!shouldPrompt(nLocation)) {
            return true;
        }
        showPrompt(nLocation);
        return false;
    };

    return <Prompt when={blocking} message={handleNavigation} />;
}
