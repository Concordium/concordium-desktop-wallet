import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import CopyIcon from '@resources/svg/copy.svg';
import CheckmarkIcon from '@resources/svg/checkmark-blue.svg';
import Button from '~/cross-app-components/Button';
import styles from './CopyButton.module.scss';

interface Props {
    value: string;
    className?: string;
}

/**
 * Button, that, when pressed, copies the given value into the user's clipboard.
 */
export default function CopyButton({ value, className }: Props): JSX.Element {
    const [copied, setCopied] = useState(false);

    useEffect(() => setCopied(false), [value]);

    async function handleOnClick() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
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
