import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeIdentityAndInitialAccount } from '~/features/IdentitySlice';
import ChoiceModal from '~/components/ChoiceModal';
import routes from '~/constants/routes.json';
import { initialAccountNameSelector } from '~/features/AccountSlice';

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
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);
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

    async function remove() {
        await removeIdentityAndInitialAccount(dispatch, identityId);
        setModalOpen(false);
    }

    return (
        <ChoiceModal
            title="The identity and initial account creation failed"
            description={`Unfortunately something went wrong with your new identity (${identityName}) and initial account (${initialAccountName}). They will be removed from the list now, and you can either go back and try again, or try again later.`}
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
            postAction={remove}
        />
    );
}
