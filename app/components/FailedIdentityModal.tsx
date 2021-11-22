import React, { useState, useEffect, useMemo } from 'react';
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
    detail: string;
}

/**
 * Modal that should be shown to the user when an identity/initial account
 * creation has been rejected.
 */
export default function FailedIdentityModal({
    identityId,
    identityName,
    isRejected,
    detail,
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

    const description = useMemo(() => {
        return (
            <>
                <p>
                    Unfortunately something went wrong with your new identity (
                    {identityName}) and initial account ({initialAccountName}).
                </p>
                <p className="textError textCenter">{detail}</p>
                <p>
                    You can either go back and try again, or try again later.
                    The identity can be removed by deleting the identity card in
                    the identity view. This will automatically delete the
                    related initial account as well
                </p>
            </>
        );
    }, [identityName, initialAccountName, detail]);

    return (
        <ChoiceModal
            disableClose
            title="The identity and initial account creation failed"
            description={description}
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
                await updateIdentity(identityId, {
                    status: IdentityStatus.RejectedAndWarned,
                });
                await loadIdentities(dispatch);
                setModalOpen(false);
            }}
        />
    );
}
