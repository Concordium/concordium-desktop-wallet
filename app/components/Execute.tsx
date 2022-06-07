import React, { useEffect, useState } from 'react';
import Button from '~/cross-app-components/Button';
import Modal from '~/cross-app-components/Modal';

interface Props<T> {
    onError: () => void;
    onSuccess: (arg: T) => void;
    execution: () => Promise<T>;
    errorTitle: string;
    errorContent: string;
}

/**
 * Modal component that will open if an error occurs while executing the
 * provided 'execution' function. When accepting the opened modal, the supplied
 * 'onError' callback is called. If everything went well, then the 'onSuccess'
 * function is called with the result of the 'execution' function.
 *
 * Note: this component has only been verified to work in the case where the
 * onError function navigates away from where this component was placed.
 */
export default function Execute<T>({
    onError,
    onSuccess,
    execution,
    errorTitle,
    errorContent,
}: Props<T>) {
    const [open, setOpen] = useState(false);
    const [started, setStarted] = useState(false);

    const runner = async () => {
        setStarted(true);
        try {
            const result = await execution();
            onSuccess(result);
        } catch (error) {
            window.log.error(error, 'Executor encountered error');
            setOpen(true);
        }
    };

    useEffect(() => {
        if (!started) {
            runner();
        }
    });

    return (
        <Modal open={open} closeOnEscape>
            <h3>{errorTitle}</h3>
            <p>{errorContent}</p>
            <Button
                onClick={() => {
                    onError();
                }}
            >
                Okay
            </Button>
        </Modal>
    );
}
