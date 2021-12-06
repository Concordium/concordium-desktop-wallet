import React from 'react';
import { useSelector } from 'react-redux';
import { chosenIdentitySelector } from '~/features/IdentitySlice';
import IdentityCard from '~/components/IdentityCard';
import FailedIdentityModal from '~/components/FailedIdentityModal';
import { isRejectedIdentity } from '~/utils/identityHelpers';

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
            {isRejectedIdentity(identity) && (
                <FailedIdentityModal identity={identity} />
            )}
            <IdentityCard identity={identity} showAttributes canEdit />
        </>
    );
}
