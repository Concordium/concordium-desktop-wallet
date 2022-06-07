import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChoiceModal from '~/components/ChoiceModal';
import routes from '~/constants/routes.json';
import { initialAccountNameSelector } from '~/features/AccountSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import { updateIdentity } from '~/database/IdentityDao';
import { IdentityStatus, RejectedIdentity } from '~/utils/types';

interface Props {
    identity: RejectedIdentity;
}

/**
 * Modal that should be shown to the user when an identity/initial account
 * creation has been rejected.
 */
export default function FailedIdentityModal({ identity }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const dispatch = useDispatch();
    const initialAccountName = useSelector(
        initialAccountNameSelector(identity.id)
    );

    useEffect(() => {
        if (identity.status === IdentityStatus.Rejected) {
            setModalOpen(true);
        } else {
            setModalOpen(false);
        }
    }, [identity.status, setModalOpen]);

    const description = useMemo(() => {
        return (
            <>
                <p>
                    Unfortunately something went wrong with your new identity (
                    {identity.name}) and initial account ({initialAccountName}).
                </p>
                <p className="textError textCenter">{identity.detail}</p>
                <p>
                    You can either go back and try again, or try again later.
                    The identity can be removed by deleting the identity card in
                    the identity view. This will automatically delete the
                    related initial account as well
                </p>
            </>
        );
    }, [identity.name, initialAccountName, identity.detail]);

    return (
        <ChoiceModal
            disableClose
            title="The identity and initial account creation failed"
            description={description}
            open={modalOpen}
            actions={[
                {
                    label: 'Try again',
                    location: {
                        pathname: routes.IDENTITYISSUANCE,
                        state: {
                            identityName: identity.name,
                            initialAccountName,
                        },
                    },
                },
                { label: 'Later' },
            ]}
            postAction={async () => {
                window.log.info(
                    `User has been warned of failed identity ${identity.id}`
                );
                await updateIdentity(identity.id, {
                    status: IdentityStatus.RejectedAndWarned,
                });
                await loadIdentities(dispatch);
                setModalOpen(false);
            }}
        />
    );
}
