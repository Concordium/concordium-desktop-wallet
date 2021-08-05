import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ipcRendererCommands from '~/constants/ipcRendererCommands.json';
import routes from '~/constants/routes.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import PageLayout from '~/components/PageLayout';
import { acceptTerms } from '~/features/MiscSlice';
import { termsUrlBase64 } from '~/utils/termsHelpers';
import { noOp } from '~/utils/basicHelpers';
import { useIpcRendererEvent } from '~/cross-app-components/util/nativeEventHooks';
import { useWindowResize } from '~/cross-app-components/util/eventHooks';
import { Listen } from '~/preloadTypes';

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
    if (!iframeEl.contentDocument?.body) {
        return;
    }

    iframeEl.contentDocument.body.style.margin = '0';

    const classes: string[] = [];
    iframeEl.contentDocument.body.classList.forEach((v) => classes.push(v));
    classes.forEach((v) => iframeEl.contentDocument?.body.classList.remove(v));

    const content = iframeEl.contentDocument.body.innerHTML;

    if (content) {
        iframeEl.contentDocument.body.innerHTML = `<div>${content}</div>`;
    }
}

function interceptClickEvent(e: MouseEvent) {
    const target = e.target as HTMLAnchorElement;
    if (target.tagName === 'A') {
        e.preventDefault();
        const href = target.getAttribute('href');

        if (href) {
            window.openUrl(href);
        }
    }
}

function hijackLinks(iframeEl: HTMLIFrameElement): () => void {
    iframeEl.contentDocument?.addEventListener('click', interceptClickEvent);

    return () => {
        iframeEl.contentDocument?.removeEventListener(
            'click',
            interceptClickEvent
        );
    };
}

export default function TermsPage({ mustAccept = false }: Props): JSX.Element {
    const dispatch = useDispatch();
    const [frameEl, setFrameEl] = useState<HTMLIFrameElement | null>(null);
    const handleResize = useCallback(() => {
        if (!frameEl) {
            return;
        }

        const height =
            frameEl.contentDocument?.body.firstElementChild?.scrollHeight;

        frameEl.height =
            height !== undefined ? Math.ceil(height).toString() : '';
    }, [frameEl]);
    useWindowResize(handleResize);
    useIpcRendererEvent(
        ipcRendererCommands.readyToShow as keyof Listen,
        handleResize
    );
    useIpcRendererEvent(
        ipcRendererCommands.didFinishLoad as keyof Listen,
        handleResize
    );

    const handleAccept = useCallback(() => {
        acceptTerms(dispatch);
    }, [dispatch]);

    useLayoutEffect(() => {
        if (!frameEl) {
            return noOp;
        }

        sanitizeDocument(frameEl);
        handleResize();

        return hijackLinks(frameEl);
    }, [frameEl, handleResize]);

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Terms and Conditions</h1>
            </PageLayout.Header>
            <PageLayout.Container
                disableBack={mustAccept}
                closeRoute={mustAccept ? undefined : routes.HOME}
                padding="vertical"
            >
                <iframe
                    className={styles.frame}
                    title="Terms and Conditions"
                    src={termsUrlBase64}
                    onLoad={(e) => {
                        const el = e.target as HTMLIFrameElement;
                        setFrameEl(el);
                    }}
                />
                {mustAccept && frameEl !== null && (
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
