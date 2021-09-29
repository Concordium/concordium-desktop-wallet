import React, { useEffect } from 'react';
import clsx from 'clsx';
import CopyIcon from '@resources/svg/copy.svg';
import CheckmarkIcon from '@resources/svg/checkmark-blue.svg';
import Button from '~/cross-app-components/Button';
import { useTimeoutState } from '~/utils/hooks';

import styles from './CopyButton.module.scss';

interface Props {
    value: string;
    className?: string;
    onClick?: () => void;
}

/**
 * Button, that, when pressed, copies the given value into the user's clipboard.
 */
export default function CopyButton({
    value,
    className,
    onClick,
}: Props): JSX.Element {
    const [copied, setCopied] = useTimeoutState(false, 2000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setCopied(false), [value]);

    async function handleOnClick() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            onClick?.();
        } catch {
            // TODO Error notification.
        }
    }

    return (
        <Button
            clear
            className={clsx(className, styles.copyIcon)}
            onClick={handleOnClick}
        >
            {copied ? <CheckmarkIcon width="18" /> : <CopyIcon width="18" />}
        </Button>
    );
}
