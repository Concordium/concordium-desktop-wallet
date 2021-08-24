import React from 'react';
import { useSelector } from 'react-redux';
import { IdentityStatus } from '~/utils/types';
import { chosenIdentitySelector } from '~/features/IdentitySlice';
import IdentityCard from '~/components/IdentityCard';
import FailedIdentityModal from '~/components/FailedIdentityModal';

/**
 * Detailed view of the chosen identity.
 */
export default function IdentityView() {
    const identity = useSelector(chosenIdentitySelector);

    if (identity === undefined) {
        return null;
    }

    return (
        <>
            <FailedIdentityModal
                identityId={identity.id}
                identityName={identity.name}
                isRejected={identity.status === IdentityStatus.Rejected}
            />
            <IdentityCard identity={identity} showAttributes canEditName />
        </>
    );
}
