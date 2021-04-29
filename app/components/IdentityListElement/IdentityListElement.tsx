import React from 'react';
import clsx from 'clsx';
import PendingImage from '@resources/svg/pending-small.svg';
import SuccessImage from '@resources/svg/success-small.svg';
import RejectedImage from '@resources/svg/warning-small.svg';
import { Identity, IdentityObject, IdentityStatus } from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import Card from '~/cross-app-components/Card';
import attributeNames from '~/constants/attributeNames.json';

import styles from './IdentityListElement.module.scss';
import SidedRow from '../SidedRow';

interface Props {
    identity: Identity;
    className?: string;
    onClick?: () => void;
    active?: boolean;
    expanded?: boolean;
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
    className,
    active = false,
    expanded = false,
}: Props): JSX.Element {
    const identityProvider = JSON.parse(identity.identityProvider);
    const identityObject: IdentityObject = JSON.parse(identity.identityObject)
        .value;

    return (
        <Card
            className={clsx(
                styles.identityListElement,
                active && styles.active,
                onClick && styles.clickable,
                className
            )}
            onClick={onClick}
            onKeyPress={onClick}
            tabIndex={0}
            role="button"
        >
            <div className={styles.container}>
                <div className={styles.topRow}>
                    {identityProvider?.metadata?.icon ? (
                        <img
                            className={styles.statusImage}
                            src={`data:image/png;base64, ${identityProvider?.metadata?.icon}`}
                            alt={identity.status}
                        />
                    ) : null}
                    {statusImage(identity.status)}
                    <span className={clsx(styles.rightAligned, 'body2')}>
                        Identity
                    </span>
                </div>

                <h1> {identity.name} </h1>
                <div className="textFaded">
                    {' '}
                    {identityObject
                        ? ` Expires on ${formatDate(
                              identityObject.attributeList.validTo
                          )} `
                        : undefined}
                </div>
            </div>
            {expanded && (
                <div className={styles.details}>
                    {Object.keys(
                        identityObject.attributeList.chosenAttributes
                    ).map((k) => (
                        <SidedRow
                            className={styles.detailsRow}
                            key={k}
                            left={(attributeNames as Record<string, string>)[k]}
                            right={
                                identityObject.attributeList.chosenAttributes[k]
                            }
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

export default IdentityListElement;
