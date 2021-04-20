import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Identity } from '~/utils/types';
import { confirmedIdentitiesSelector } from '~/features/IdentitySlice';
import IdentityListElement from '~/components/IdentityListElement';

interface Props {
    setReady: (ready: boolean) => void;
    setIdentity: (identity: Identity) => void;
    elementClassName?: string;
}

/**
 * Allows the user to pick an Identity
 */
export default function PickIdentity({
    setReady,
    setIdentity,
    elementClassName,
}: Props): JSX.Element {
    const identities = useSelector(confirmedIdentitiesSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();

    return (
        <>
            {identities.map((identity: Identity, index: number) => (
                <IdentityListElement
                    identity={identity}
                    key={identity.id}
                    className={elementClassName}
                    active={chosenIndex === index}
                    onClick={() => {
                        setReady(true);
                        setChosenIndex(index);
                        setIdentity(identity);
                    }}
                />
            ))}
        </>
    );
}
