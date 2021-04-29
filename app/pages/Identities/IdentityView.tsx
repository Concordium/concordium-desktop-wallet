import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { chosenIdentitySelector } from '~/features/IdentitySlice';
import IdentityListElement from '~/components/IdentityListElement';
import { IdentityStatus } from '~/utils/types';
import ChoiceModal from '~/components/ChoiceModal';
import routes from '~/constants/routes.json';

/**
 * Detailed view of the chosen identity.
 */
export default function IdentityView() {
    const identity = useSelector(chosenIdentitySelector);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (identity && identity.status === IdentityStatus.Rejected) {
            setModalOpen(true);
        } else {
            setModalOpen(false);
        }
    }, [identity, setModalOpen]);

    if (identity === undefined) {
        return null;
    }

    return (
        <>
            {identity.status === IdentityStatus.Rejected && (
                <ChoiceModal
                    title={`The identity and initial account creation failed (${identity.name})`}
                    description="Unfortunately something went wrong with your new identity and initial account. You can either go back and try again, or try again later."
                    open={modalOpen}
                    actions={[
                        {
                            label: 'Try Again',
                            location: routes.IDENTITYISSUANCE,
                        },
                        { label: 'Later' },
                    ]}
                    postAction={() => setModalOpen(false)}
                />
            )}
            <IdentityListElement identity={identity} expanded />
        </>
    );
}
