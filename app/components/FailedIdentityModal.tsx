import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChoiceModal from '~/components/ChoiceModal';
import routes from '~/constants/routes.json';
import { initialAccountNameSelector } from '~/features/AccountSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import { updateIdentity } from '~/database/IdentityDao';
import { IdentityStatus } from '~/utils/types';

interface Props {
    identityId: number;
    identityName: string;
    isRejected: boolean;
}

/**
 * Modal, which appears on rejected identities/initial accounts.
 */
export default function FailedIdentityModal({
    identityId,
    identityName,
    isRejected,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const dispatch = useDispatch();
    const initialAccountName = useSelector(
        initialAccountNameSelector(identityId)
    );

    useEffect(() => {
        if (isRejected) {
            setModalOpen(true);
        } else {
            setModalOpen(false);
        }
    }, [isRejected, setModalOpen]);

    return (
        <ChoiceModal
            disableClose
            title="The identity and initial account creation failed"
            description={`Unfortunately something went wrong with your new identity (${identityName}) and initial account (${initialAccountName}). You can either go back and try again, or try again later. The identity can be removed by deleting the identity card in the identity view. This will automatically delete the related initial account as well.`}
            open={modalOpen}
            actions={[
                {
                    label: 'Try Again',
                    location: {
                        pathname: routes.IDENTITYISSUANCE,
                        state: {
                            identityName,
                            initialAccountName,
                        },
                    },
                },
                { label: 'Later' },
            ]}
            postAction={async () => {
                window.log.info(
                    `User has been warned of failed identity ${identityId}`
                );
                await updateIdentity(identityId, {
                    status: IdentityStatus.RejectedAndWarned,
                });
                await loadIdentities(dispatch);
                setModalOpen(false);
            }}
        />
    );
}
