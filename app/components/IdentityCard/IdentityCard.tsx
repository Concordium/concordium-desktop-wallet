import React, { useState } from 'react';
import clsx from 'clsx';
import PendingImage from '@resources/svg/pending-small.svg';
import SuccessImage from '@resources/svg/success-small.svg';
import RejectedImage from '@resources/svg/warning-small.svg';
import EditIcon from '@resources/svg/edit.svg';
import CheckIcon from '@resources/svg/checkmark-blue.svg';
import { useDispatch } from 'react-redux';
import { AttributeKey } from '@concordium/node-sdk';
import { Identity, IdentityObject, IdentityStatus } from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import Card from '~/cross-app-components/Card';
import SidedRow from '../SidedRow';
import {
    attributeNamesMap,
    formatAttributeValue,
    compareAttributes,
    IDENTITY_NAME_MAX_LENGTH,
} from '~/utils/identityHelpers';
import Form from '../Form';
import Button from '~/cross-app-components/Button';
import { useUpdateEffect } from '~/utils/hooks';
import { editIdentityName } from '~/features/IdentitySlice';
import DeleteIdentity from './DeleteIdentity';

import styles from './IdentityCard.module.scss';

interface EditIdentityForm {
    name: string;
}

interface Props {
    identity: Identity;
    className?: string;
    onClick?: () => void;
    active?: boolean;
    showAttributes?: boolean | AttributeKey[];
    /**
     * If true, allows editing name of identity inline. Defaults to false.
     */
    canEditName?: boolean;
}

// Returns the image corresponding to the given status.
function statusImage(status: IdentityStatus) {
    switch (status) {
        case IdentityStatus.Confirmed:
            return <SuccessImage />;
        case IdentityStatus.RejectedAndWarned:
        case IdentityStatus.Rejected:
            return <RejectedImage />;
        case IdentityStatus.Pending:
            return <PendingImage height="20" />;
        default:
            return undefined;
    }
}

/**
 * Displays the information of the Identity.
 */
function IdentityListElement({
    identity,
    onClick,
    className,
    active = false,
    showAttributes = false,
    canEditName = false,
}: Props): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const dispatch = useDispatch();
    const identityProvider = JSON.parse(identity.identityProvider);
    const identityObject: IdentityObject | null = JSON.parse(
        identity.identityObject
    )?.value;

    async function handleSubmit({ name }: EditIdentityForm) {
        await editIdentityName(dispatch, identity.id, name);
        setIsEditing(false);
    }

    useUpdateEffect(() => {
        setIsEditing(false);
    }, [identity]);

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
                        {identity.status === IdentityStatus.RejectedAndWarned &&
                        canEditName ? (
                            <DeleteIdentity identity={identity} />
                        ) : (
                            'Identity'
                        )}
                    </span>
                </div>
                <Form<EditIdentityForm>
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <h1 className={styles.name}>
                        {isEditing ? (
                            <Form.InlineInput
                                name="name"
                                className={styles.nameField}
                                defaultValue={identity.name}
                                fallbackValue={identity.name}
                                autoFocus
                                rules={{
                                    required: true,
                                    maxLength: IDENTITY_NAME_MAX_LENGTH,
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    marginRight: canEditName ? 2 : undefined, // To align as good as possible with input in edit mode.
                                }}
                            >
                                {identity.name}
                            </span>
                        )}
                    </h1>
                    {canEditName &&
                        (isEditing ? (
                            <Form.Submit className={styles.edit} clear>
                                <CheckIcon />
                            </Form.Submit>
                        ) : (
                            <Button
                                className={styles.edit}
                                clear
                                onClick={() => setIsEditing(true)}
                            >
                                <EditIcon />
                            </Button>
                        ))}
                </Form>
                <div className="textFaded">
                    {' '}
                    {identityObject
                        ? ` Expires on ${formatDate(
                              identityObject.attributeList.validTo
                          )} `
                        : undefined}
                </div>
            </div>
            {showAttributes && identityObject && (
                <div className={styles.details}>
                    {Object.entries(
                        identityObject.attributeList.chosenAttributes ?? {}
                    )
                        .filter(
                            ([k]) =>
                                showAttributes === true ||
                                showAttributes.includes(k as AttributeKey)
                        )
                        .sort(([k1], [k2]) =>
                            compareAttributes(
                                k1 as AttributeKey,
                                k2 as AttributeKey
                            )
                        )
                        .map(([k, v]) => (
                            <SidedRow
                                className={styles.detailsRow}
                                key={k}
                                left={attributeNamesMap[k as AttributeKey]}
                                right={formatAttributeValue(
                                    k as AttributeKey,
                                    v
                                )}
                            />
                        ))}
                </div>
            )}
        </Card>
    );
}

export default IdentityListElement;
