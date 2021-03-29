import React from 'react';
import clsx from 'clsx';
import PendingImage from '@resources/svg/pending_old.svg';
import SuccessImage from '@resources/svg/success_old.svg';
import RejectedImage from '@resources/svg/warning_old.svg';
import { Identity, IdentityStatus } from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import styles from './IdentityListElement.module.scss';

interface Props {
    identity: Identity;
    onClick?: () => void;
    active?: boolean;
}

// Returns the image corresponding to the given status.
function statusImage(status: IdentityStatus) {
    switch (status) {
        case IdentityStatus.Confirmed:
            return <SuccessImage />;
        case IdentityStatus.Rejected:
            return <RejectedImage />;
        case IdentityStatus.Pending:
            return <PendingImage />;
        default:
            return undefined;
    }
}

/**
 * Displays the information of the Identity.
 * TODO: Simplify structure
 */
function IdentityListElement({
    identity,
    onClick,
    active = false,
}: Props): JSX.Element {
    const identityProvider = JSON.parse(identity.identityProvider);
    const identityObject = JSON.parse(identity.identityObject);
    return (
        <div
            className={clsx(
                styles.identityListElement,
                active && styles.active
            )}
            onClick={onClick}
            onKeyPress={onClick}
            tabIndex={0}
            role="button"
        >
            <div className={styles.topRow}>
                <img
                    className={styles.statusImage}
                    src={`data:image/png;base64, ${identityProvider.metadata.icon}`}
                    alt={identity.status}
                />
                {statusImage(identity.status)}
                <h3 className={styles.rightAligned}>Identity</h3>
            </div>

            <h1> {identity.name} </h1>
            <h3>
                {' '}
                {identityObject
                    ? ` Expires on ${formatDate(
                          identityObject.value.attributeList.validTo
                      )} `
                    : undefined}
            </h3>
        </div>
    );
}

export default IdentityListElement;
