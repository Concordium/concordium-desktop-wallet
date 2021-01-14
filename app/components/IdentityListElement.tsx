import React from 'react';
import styles from './Identity.css';
import { Identity, IdentityStatus } from '../utils/types';
import pendingImage from '../../resources/pending.svg';
import successImage from '../../resources/success.svg';
import rejectedImage from '../../resources/warning.svg';

interface Props {
    identity: Identity;
    onClick?: () => void;
    highlighted?: boolean;
    index: number;
}

function statusImage(status: IdentityStatus) {
    switch (status) {
        case IdentityStatus.confirmed:
            return successImage;
        case IdentityStatus.rejected:
            return rejectedImage;
        case IdentityStatus.pending:
            return pendingImage;
        default:
            return undefined;
    }
}

function formatDate(date: string) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    return dtFormat.format(new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}`));
}

function IdentityListElement({
    identity,
    onClick,
    highlighted,
    index,
}: Props): JSX.Element {
    const identityProvider = JSON.parse(identity.identityProvider);
    const identityObject = JSON.parse(identity.identityObject);
    return (
        <div
            onClick={onClick}
            key={identity.name}
            tabIndex={index}
            className={`${styles.identityListElement} ${
                highlighted ? styles.chosenIdentityListElement : null
            }`}
        >
            {}{' '}
            <img
                className={styles.providerImage}
                src={`data:image/png;base64, ${identityProvider.metadata.icon}`}
                alt={identityProvider.ipInfo.ipDescription.name}
            />
            <img
                className={styles.statusImage}
                src={statusImage(identity.status)}
                alt={identity.status}
            />
            <h2> {identity.name} </h2>
            {identityObject
                ? ` Expires on ${formatDate(
                      identityObject.value.attributeList.validTo
                  )} `
                : undefined}
        </div>
    );
}

IdentityListElement.defaultProps = {
    onClick: undefined,
    highlighted: false,
};

export default IdentityListElement;
