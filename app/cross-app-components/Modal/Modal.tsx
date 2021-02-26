import React, {
    cloneElement,
    MouseEventHandler,
    PropsWithChildren,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import Portal from '../Portal';

import styles from './Modal.module.scss';

interface WithOnClick {
    onClick: MouseEventHandler;
}

interface ModalProps<TTrigger extends WithOnClick> {
    trigger: ReactElement<TTrigger>;
    closeOnEscape?: boolean;
}

export default function Modal<TTrigger extends WithOnClick>({
    trigger,
    closeOnEscape = false,
    children,
}: PropsWithChildren<ModalProps<TTrigger>>): JSX.Element | null {
    const [open, setOpen] = useState<boolean>(false);

    const onClick: MouseEventHandler = useCallback(
        (e) => {
            setOpen(true);
            trigger.props.onClick(e);
        },
        [trigger]
    );

    const triggerWithClose = useMemo(() => {
        return cloneElement(trigger, {
            ...trigger.props,
            onClick,
        });
    }, [trigger, onClick]);

    const handleKeyUp = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'ESCAPE') {
                setOpen(false);
            }
        },
        [closeOnEscape]
    );

    useEffect(() => {
        if (document) {
            document.addEventListener('keyup', handleKeyUp);
        }
    }, [handleKeyUp]);

    if (!open) {
        return null;
    }

    return (
        <>
            {triggerWithClose}
            <Portal className={styles.root}>{children}</Portal>
        </>
    );
}
