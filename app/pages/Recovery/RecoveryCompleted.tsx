import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import routes from '~/constants/routes.json';
import Button from '~/cross-app-components/Button';
import { StateUpdate } from '~/utils/types';

import styles from './Recovery.module.scss';

interface Props {
    messages: string[];
    setMessages: StateUpdate<string[]>;
}

/**
 * Displays the messages after recovery has been completed
 */
export default function RecoveryCompleted({ messages, setMessages }: Props) {
    const dispatch = useDispatch();

    return (
        <>
            <div className={styles.messages}>
                <h2 className={styles.messagesTitleCompleted}>
                    Recovery status:
                </h2>
                {messages.map((m) => (
                    <p key={m}>{m}</p>
                ))}
                <Button
                    className={styles.topButton}
                    onClick={() => dispatch(push(routes.ACCOUNTS))}
                >
                    Go to accounts
                </Button>
                <Button
                    className={styles.button}
                    onClick={() => {
                        setMessages([]);
                        dispatch(push(routes.RECOVERY));
                    }}
                >
                    Recover again
                </Button>
            </div>
        </>
    );
}
