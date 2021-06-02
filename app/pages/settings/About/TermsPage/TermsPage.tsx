import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import routes from '~/constants/routes.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import PageLayout from '~/components/PageLayout';
import { acceptTerms } from '~/features/SettingsSlice';
import { storeTerms, termsUrlBase64 } from '~/utils/termsHelpers';

import styles from './TermsPage.module.scss';

interface Props {
    /**
     * Defaults to false, resulting in accept button not being shown.
     */
    mustAccept?: boolean;
}

/**
 * Strips css classes from iframe body tag.
 */
function sanitizeDocument(iframeEl: HTMLIFrameElement): void {
    const classes: string[] = [];
    iframeEl.contentDocument?.body.classList.forEach((v) => classes.push(v));
    classes.forEach((v) => iframeEl.contentDocument?.body.classList.remove(v));
}

export default function TermsPage({ mustAccept = false }: Props): JSX.Element {
    const dispatch = useDispatch();
    const [frameHeight, setFrameHeight] = useState<number | undefined>(
        undefined
    );

    const handleAccept = useCallback(() => {
        storeTerms();
        dispatch(acceptTerms());
    }, [dispatch]);

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Terms and Conditions</h1>
            </PageLayout.Header>
            <PageLayout.Container
                disableBack={mustAccept}
                closeRoute={mustAccept ? undefined : routes.SETTINGS_ABOUT}
                padding="vertical"
            >
                <iframe
                    className={styles.frame}
                    title="Terms and Conditions"
                    src={termsUrlBase64}
                    onLoad={(e) => {
                        const el = e.target as HTMLIFrameElement;
                        sanitizeDocument(el);
                        setFrameHeight(el.contentDocument?.body.scrollHeight);
                    }}
                    height={frameHeight}
                />
                {mustAccept && (
                    <ButtonNavLink
                        className={styles.accept}
                        to={routes.HOME}
                        size="regular"
                        inverted={false}
                        onClick={handleAccept}
                    >
                        Yes, I Accept
                    </ButtonNavLink>
                )}
            </PageLayout.Container>
        </PageLayout>
    );
}
