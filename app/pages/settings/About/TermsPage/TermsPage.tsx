import React, { useState } from 'react';
// eslint-disable-next-line import/no-webpack-loader-syntax
import terms from 'url-loader!@resources/html/Termsandconditions.html';
import routes from '~/constants/routes.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import PageLayout from '~/components/PageLayout';

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
    const [frameHeight, setFrameHeight] = useState<number | undefined>(
        undefined
    );
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Terms & Conditions</h1>
            </PageLayout.Header>
            <PageLayout.Container
                disableBack={mustAccept}
                closeRoute={mustAccept ? undefined : routes.SETTINGS_ABOUT}
                padding="vertical"
            >
                <iframe
                    className={styles.frame}
                    title="Terms and conditions"
                    src={terms}
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
                    >
                        Yes, I Accept
                    </ButtonNavLink>
                )}
            </PageLayout.Container>
        </PageLayout>
    );
}
