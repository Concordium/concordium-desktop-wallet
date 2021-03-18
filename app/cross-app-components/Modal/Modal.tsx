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
import { AnimatePresence, motion, Variants, Transition } from 'framer-motion';
import CloseButton from '../CloseButton';
import Portal from '../Portal';

import styles from './Modal.module.scss';
import DetectClickOutside from '../DetectClickOutside';
import DetectKeyPress from '../DetectKeyPress';

const transition: Transition = {
    ease: 'easeOut',
    duration: 0.2,
};

const bgTransitionVariants: Variants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
};

const modalTransitionVariants: Variants = {
    open: { opacity: 1, scale: 1 },
    closed: { opacity: 0, scale: 1.1 },
};

interface WithOnClick {
    onClick?: MouseEventHandler;
}

export interface ModalProps<TTrigger extends WithOnClick = WithOnClick> {
    /**
     * Supply element that acts as a trigger for modal to open. Must have "onClick" as prop.
     */
    trigger?: ReactElement<TTrigger>;
    /**
     * defaults to true
     */
    closeOnEscape?: boolean;
    /**
     * Disable close functionality within the modal. Good for user actions that must be taken.
     */
    disableClose?: boolean;
    /**
     * Control whether modal is open or not.
     */
    open: boolean;
    onOpen(): void;
    onClose(): void;
}

/**
 * @description
 * Opens content in a modal overlay on top of \<MainLayout /\>.
 *
 * @example
 * <Modal trigger={<button type="button">Click me</button>} open={isOpen} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
 *   This content is shown in a modal!
 * </Modal>
 */
export default function Modal<TTrigger extends WithOnClick = WithOnClick>({
    trigger,
    closeOnEscape = true,
    disableClose = false,
    open: isOpenOverride,
    onOpen,
    onClose,
    children,
}: PropsWithChildren<ModalProps<TTrigger>>): JSX.Element | null {
    const [isExiting, setIsExiting] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(isOpenOverride);

    const open = useCallback(() => {
        setIsOpen(true);
        onOpen();
    }, [onOpen]);

    const close = useCallback(
        (ignoreDisable = false) => {
            if (!disableClose || ignoreDisable) {
                setIsExiting(true);
            }
        },
        [disableClose]
    );

    useEffect(() => {
        if (isOpenOverride && !isOpen) {
            open();
        } else if (!isOpenOverride && isOpen) {
            close(true);
        }
    }, [isOpenOverride, open, close, isOpen]);

    const onTriggerClick: MouseEventHandler = useCallback(
        (e) => {
            open();

            if (trigger?.props.onClick !== undefined) {
                trigger.props.onClick(e);
            }
        },
        [trigger, open]
    );

    const triggerWithOpen = useMemo(() => {
        if (!trigger) {
            return undefined;
        }

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

    const handleExitComplete = useCallback(() => {
        setIsExiting(false);
        setIsOpen(false);
        onClose();
    }, [onClose]);

    return (
        <>
            {triggerWithOpen}
            {isOpen && (
                <Portal
                    className={styles.root}
                    root={document.getElementsByTagName('body')[0]}
                >
                    <AnimatePresence onExitComplete={handleExitComplete}>
                        {!isExiting && (
                            <DetectKeyPress onKeyPress={handleKeyUp}>
                                <motion.div
                                    className={styles.bg}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    variants={bgTransitionVariants}
                                    transition={transition}
                                />
                                <DetectClickOutside
                                    as={motion.div}
                                    className={styles.modal}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    variants={modalTransitionVariants}
                                    transition={transition}
                                    onClickOutside={close}
                                >
                                    {!disableClose && (
                                        <CloseButton
                                            className={styles.close}
                                            onClick={close}
                                        />
                                    )}
                                    {children}
                                </DetectClickOutside>
                            </DetectKeyPress>
                        )}
                    </AnimatePresence>
                </Portal>
            )}
        </>
    );
}
