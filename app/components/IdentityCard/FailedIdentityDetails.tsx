import React from 'react';
import clsx from 'clsx';
import { Identity } from '~/utils/types';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import ExternalLink from '~/components/ExternalLink';
import { getSessionId } from '~/utils/identityHelpers';

import styles from './IdentityCard.module.scss';

interface FailedIdentityDetailsProps {
    identity: Identity;
}

export default function FailedIdentityDetails({
    identity,
}: FailedIdentityDetailsProps) {
    const sessionId = getSessionId(identity);
    const mail = 'concordium-idiss@notabene.id';
    const subject = `Reference: ${sessionId}`;

    return (
        <div className={styles.details}>
            <p>
                Contact{' '}
                <ExternalLink href={`mailto:${mail}?subject=${subject}`}>
                    {mail}
                </ExternalLink>{' '}
                for support.
            </p>
            <p>Please provide the reference, when doing so.</p>
            <SidedRow
                className={clsx('body2', styles.detailsRow)}
                left={`Reference: ${sessionId.substring(0, 8)}...`}
                right={<CopyButton value={sessionId} />}
            />
        </div>
    );
}
