import React from 'react';
import { Identity } from '~/utils/types';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import { getSessionId } from '~/utils/identityHelpers';

import styles from './IdentityCard.module.scss';

interface FailedIdentityDetailsProps {
    identity: Identity;
}

export default function FailedIdentityDetails({
    identity,
}: FailedIdentityDetailsProps) {
    const sessionId = getSessionId(identity);

    return (
        <div className={styles.details}>
            <SidedRow
                className={styles.detailsRow}
                left={`SessionId: ${sessionId.substring(0, 8)}...`}
                right={<CopyButton value={sessionId} />}
            />
        </div>
    );
}
