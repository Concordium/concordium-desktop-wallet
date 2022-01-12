import React, { useState, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { RejectedIdentity, IdentityProvider } from '~/utils/types';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import ExternalLink from '~/components/ExternalLink';
import { getSessionId } from '~/utils/identityHelpers';
import pkg from '~/package.json';
import { useTimeoutState } from '~/utils/hooks';
import AbortController from '~/utils/AbortController';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import { getIdentityProviders } from '~/utils/httpRequests';
import Loading from '~/cross-app-components/Loading';

import styles from './IdentityCard.module.scss';

const getEmailTryTimeout = 5000;

interface FailedIdentityDetailsProps {
    identity: RejectedIdentity;
}

function getOS() {
    const { platform } = window;
    switch (platform.toLowerCase()) {
        case 'win32':
            return 'Windows';
        case 'darwin':
            return 'MacOs';
        case 'linux':
            return 'Linux';
        default:
            return platform;
    }
}

async function getIdentityProviderMail(
    ipIdentity: number
): Promise<string | undefined> {
    const providers = await getIdentityProviders();
    const provider = providers.find((p) => p.ipInfo.ipIdentity === ipIdentity);
    return provider?.metadata?.support;
}

export default function FailedIdentityDetails({
    identity,
}: FailedIdentityDetailsProps) {
    const [connecting, setConnecting] = useState(true);
    const [mail, setMail] = useState<string>();
    const sessionId = getSessionId(identity);
    const identityProvider: IdentityProvider = JSON.parse(
        identity.identityProvider
    );
    const identityProviderName = identityProvider.ipInfo.ipDescription.name;
    const cc = 'idiss@concordium.software';
    const subject = `Issuance reference: ${sessionId}`;
    const body = `Hi! My identity issuance failed.

Here is my info:

Issuance reference:
${sessionId}

Desktop Wallet version:
v${pkg.version}

Operating system:
${getOS()}`;

    const [copied, setCopied] = useTimeoutState(false, 2000);

    useEffect(
        () => () => {
            setMail(undefined);
            setConnecting(true);
        },
        [identityProvider.ipInfo.ipIdentity]
    );

    const loadSupportMail = useCallback(async (controller: AbortController) => {
        let supportMail;
        try {
            supportMail = await getIdentityProviderMail(
                identityProvider.ipInfo.ipIdentity
            );
        } catch {
            // continue regardless of error
        }
        if (!controller.isAborted) {
            setConnecting(false);
            if (supportMail) {
                setMail(supportMail);
            } else {
                setTimeout(
                    () => controller.isAborted || setConnecting(true),
                    getEmailTryTimeout
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const controller = useMemo(() => new AbortController(), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => controller.abort(), []);
    useEffect(() => {
        if (connecting && !mail) {
            controller.start();
            loadSupportMail(controller);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connecting, mail, loadSupportMail]);

    const failedDetails = (
        <>
            <p className="textError textCenter mB5">
                Identity issuance failed:
            </p>
            <p className="textError textCenter body3 mT0">{identity.detail}</p>
        </>
    );

    const targetNet = getTargetNet();
    if (targetNet !== Net.Mainnet) {
        return (
            <div className={clsx('body3 p20', styles.failedDetails)}>
                {failedDetails}
            </div>
        );
    }

    if (mail === undefined) {
        return (
            <div className={clsx('body3 p20', styles.failedDetails)}>
                {failedDetails}
                {connecting && <Loading className="pV20" inline />}
                {!connecting && (
                    <div>
                        {' '}
                        Unable to load identity provider support information.
                        Please check your internet connection.{' '}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={clsx('body3 p20', styles.failedDetails)}>
            {failedDetails}
            <p className={clsx(styles.failedDetailsLine, 'pV10')}>
                For more information and support, you can contact{' '}
                {identityProviderName} (and Concordium on CC) via
            </p>
            <SidedRow
                className={styles.failedDetailsLine}
                left={
                    <ExternalLink
                        href={`mailto:${mail}?cc=${cc}&subject=${subject}&body=${encodeURIComponent(
                            body
                        )}`}
                    >
                        {mail}
                    </ExternalLink>
                }
                right={<CopyButton value={mail} />}
            />
            <SidedRow
                className={styles.failedDetailsLine}
                left={`Optional CC: ${cc}`}
                right={<CopyButton value={cc} />}
            />
            <p className={clsx(styles.failedDetailsLine, 'pV20')}>
                If clicking the e-mail link doesn’t open your e-mail client with
                an autofilled e-mail, you can enter the following information in
                your e-mail.
            </p>
            <div
                className={clsx(
                    styles.failedDetailsBodyContainer,
                    copied && styles.failedDetailsBodyContainerCopied
                )}
            >
                <pre className={styles.failedIdentityBody}>{body}</pre>
                <CopyButton
                    className={styles.failedDetailsBodyContainerButton}
                    onClick={() => setCopied(true)}
                    value={body}
                />
            </div>
        </div>
    );
}
