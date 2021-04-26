import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Identity } from '~/utils/types';
import { confirmedIdentitiesSelector } from '~/features/IdentitySlice';
import IdentityListElement from '~/components/IdentityListElement';

interface Props {
    chosenIdentity?: Identity;
    setReady: (ready: boolean) => void;
    setIdentity: (identity: Identity) => void;
    elementClassName?: string;
}

/**
 * Allows the user to pick an Identity
 */
export default function PickIdentity({
    chosenIdentity,
    setReady,
    setIdentity,
    elementClassName,
}: Props): JSX.Element {
    const identities = useSelector(confirmedIdentitiesSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();

    useEffect(() => {
        if (chosenIdentity) {
            setReady(true);
            setChosenIndex(
                identities.findIndex(
                    (identity) => identity.id === chosenIdentity.id
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
