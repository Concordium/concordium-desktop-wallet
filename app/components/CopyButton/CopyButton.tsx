import React, { useEffect } from 'react';
import CopyIcon from '@resources/svg/copy.svg';
import CheckmarkIcon from '@resources/svg/checkmark-blue.svg';
import { useTimeoutState } from '~/utils/hooks';
import IconButton from '~/cross-app-components/IconButton';

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
        } catch (e) {
            window.log.warn(e, 'Copy button OnClick failed');
        }
    }

    return (
        <IconButton className={className} onClick={handleOnClick}>
            {copied ? (
                <CheckmarkIcon width="18" height="18" />
            ) : (
                <CopyIcon className={styles.copyIcon} width="18" height="18" />
            )}
        </IconButton>
    );
}
