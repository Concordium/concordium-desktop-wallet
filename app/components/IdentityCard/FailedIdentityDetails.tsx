import React from 'react';
import clsx from 'clsx';
import { Identity, IdentityProvider } from '~/utils/types';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import ExternalLink from '~/components/ExternalLink';
import { getSessionId } from '~/utils/identityHelpers';
import pkg from '~/package.json';
import { useTimeoutState } from '~/utils/hooks';
import { getTargetNet, Net } from '~/utils/ConfigHelper';

import styles from './IdentityCard.module.scss';

interface FailedIdentityDetailsProps {
    identity: Identity;
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

function getIdentityProviderMail(identityProvider: number): string | undefined {
    switch (identityProvider) {
        case 1:
            return 'concordium-idiss@notabene.id';
        default:
            return undefined;
    }
}

export default function FailedIdentityDetails({
    identity,
}: FailedIdentityDetailsProps) {
    const sessionId = getSessionId(identity);
    const identityProvider: IdentityProvider = JSON.parse(
        identity.identityProvider
    );
    const identityProviderName = identityProvider.ipInfo.ipDescription.name;
    const mail = getIdentityProviderMail(identityProvider.ipInfo.ipIdentity);
    const { url } = identityProvider.ipInfo.ipDescription;
    const cc = 'idiss@concordium.software';
    const subject = `Issuance Reference: ${sessionId}`;
    const body = `Hi! My identity issuance failed.

Here is my info:

Issuance reference:
${sessionId}

Desktop Wallet version:
v${pkg.version}

Operating system:
${getOS()}`;

    const [copied, setCopied] = useTimeoutState(false, 2000);

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

    return (
        <div className={clsx('body3 p20', styles.failedDetails)}>
            {failedDetails}
            {mail && (
                <>
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
                        If clicking the e-mail link doesn’t open your e-mail
                        client with an autofilled e-mail, you can enter the
                        following information in your e-mail.
                    </p>
                </>
            )}
            {Boolean(mail) || (
                <>
                    <p className={clsx(styles.failedDetailsLine, 'pV10')}>
                        We don’t have the support email for{' '}
                        {identityProviderName} yet, but you can check their
                        website.
                    </p>
                    <SidedRow
                        className={styles.failedDetailsLine}
                        left={<ExternalLink href={url}>{url}</ExternalLink>}
                        right={<CopyButton value={url} />}
                    />
                    <p className={clsx(styles.failedDetailsLine, 'pV20')}>
                        When seeking support please include the following
                        information.
                    </p>
                </>
            )}
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
