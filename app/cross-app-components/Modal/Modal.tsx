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
import CloseButton from '../CloseButton';
import Portal from '../Portal';

import styles from './Modal.module.scss';

interface WithOnClick {
    onClick?: MouseEventHandler;
}

export interface ModalProps<TTrigger extends WithOnClick> {
    trigger: ReactElement<TTrigger>;
    closeOnEscape?: boolean;
    disableClose?: boolean;
}

export default function Modal<TTrigger extends WithOnClick>({
    trigger,
    closeOnEscape = true,
    disableClose = false,
    children,
}: PropsWithChildren<ModalProps<TTrigger>>): JSX.Element | null {
    const [open, setOpen] = useState<boolean>(false);

    const close = useCallback(() => {
        if (!disableClose) {
            setOpen(false);
        }
    }, [disableClose]);

    const onTriggerClick: MouseEventHandler = useCallback(
        (e) => {
            setOpen(true);

            if (trigger.props.onClick !== undefined) {
                trigger.props.onClick(e);
            }
        },
        [trigger]
    );

    const triggerWithOpen = useMemo(() => {
        return cloneElement(trigger, {
            ...trigger.props,
            onClick: onTriggerClick,
        });
    }, [trigger, onTriggerClick]);

    const handleKeyUp = useCallback(
        (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                close();
            }
        },
        [closeOnEscape, close]
    );

    useEffect(() => {
        if (document) {
            document.addEventListener('keyup', handleKeyUp, true);
        }
    }, [handleKeyUp]);

    if (!open) {
        return triggerWithOpen;
    }

    return (
        <>
            {triggerWithOpen}
            <Portal
                className={styles.root}
                root={document.getElementById('main-layout')}
            >
                <div className={styles.modal}>
                    <CloseButton className={styles.close} onClick={close} />
                    {children}
                </div>
            </Portal>
        </>
    );
}
