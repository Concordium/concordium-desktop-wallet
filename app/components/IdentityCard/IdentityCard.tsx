import React, { useState } from 'react';
import clsx from 'clsx';
import PendingImage from '@resources/svg/pending-arrows.svg';
import SuccessImage from '@resources/svg/success-small.svg';
import RejectedImage from '@resources/svg/warning-small.svg';
import EditIcon from '@resources/svg/edit.svg';
import CheckIcon from '@resources/svg/checkmark-blue.svg';
import { useDispatch } from 'react-redux';
import {
    Identity,
    IdentityObject,
    IdentityStatus,
    AttributeKeyName,
} from '~/utils/types';
import { formatDate } from '~/utils/timeHelpers';
import { filterRecordEntries } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';
import {
    IDENTITY_NAME_MAX_LENGTH,
    isConfirmedIdentity,
} from '~/utils/identityHelpers';
import Form from '../Form';
import Button from '~/cross-app-components/Button';
import { useUpdateEffect } from '~/utils/hooks';
import { editIdentityName } from '~/features/IdentitySlice';
import DeleteIdentity from './DeleteIdentity';
import FailedIdentityDetails from './FailedIdentityDetails';
import DisplayIdentityAttributes from '~/components/DisplayIdentityAttributes';

import styles from './IdentityCard.module.scss';

interface EditIdentityForm {
    name: string;
}

interface Props {
    identity: Identity;
    className?: string;
    onClick?: () => void;
    active?: boolean;
    showAttributes?: boolean | AttributeKeyName[];
    /**
     * If true, allows editing name of identity inline, and deleting it, if it has failed status. Defaults to false.
     */
    canEdit?: boolean;
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
            return <PendingImage height="24" />;
        default:
            return undefined;
    }
}

function getRightCorner(identity: Identity, canEdit: boolean) {
    if (identity.status === IdentityStatus.RejectedAndWarned && canEdit) {
        return <DeleteIdentity identity={identity} />;
    }
    if (identity.status === IdentityStatus.Recovered) {
        return null;
    }
    return 'Identity';
}

/**
 * Displays the information of the Identity.
 */
function IdentityListElement({
    identity,
    onClick,
    className,
    active = false,
    canEdit = false,
    showAttributes = false,
}: Props): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const dispatch = useDispatch();
    const identityProvider = JSON.parse(identity.identityProvider);
    const identityObject: IdentityObject | null = isConfirmedIdentity(identity)
        ? JSON.parse(identity.identityObject).value
        : null;

    const isRecovered = identity.status === IdentityStatus.Recovered;

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
                        {getRightCorner(identity, canEdit)}
                    </span>
                </div>
                <Form<EditIdentityForm>
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <h2 className={styles.name}>
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
                                    marginRight: canEdit ? 2 : undefined, // To align as good as possible with input in edit mode.
                                }}
                            >
                                {identity.name}
                            </span>
                        )}
                    </h2>
                    {canEdit &&
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
                <div className="textFaded pH30">
                    {' '}
                    {!isRecovered && identityObject
                        ? ` Expires on ${formatDate(
                              identityObject.attributeList.validTo
                          )} `
                        : undefined}
                    {isRecovered && 'Identity from account recovery.'}
                    <br />
                    {isRecovered &&
                        showAttributes &&
                        'This cannot be used to create new accounts.'}
                </div>
            </div>
            {showAttributes && !isRecovered && identityObject && (
                <div className={styles.details}>
                    <DisplayIdentityAttributes
                        className={styles.detailsRow}
                        attributes={filterRecordEntries(
                            identityObject.attributeList.chosenAttributes ?? {},
                            (k) =>
                                showAttributes === true ||
                                showAttributes.includes(k as AttributeKeyName)
                        )}
                    />
                </div>
            )}
            {showAttributes &&
                identity.status === IdentityStatus.RejectedAndWarned && (
                    <FailedIdentityDetails identity={identity} />
                )}
        </Card>
    );
}

export default IdentityListElement;
