import React, { useState } from 'react';
import { Menu } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { Identity } from '../../utils/types';
import { confirmedIdentitiesSelector } from '../../features/IdentitySlice';
import IdentityListElement from '../../components/IdentityListElement';

interface Props {
    setReady: (ready: boolean) => void;
    setIdentity: (identity: Identity) => void;
}

/**
 * Allows the user to pick an Identity
 */
export default function PickIdentity({
    setReady,
    setIdentity,
}: Props): JSX.Element {
    const identities = useSelector(confirmedIdentitiesSelector);
    const [chosenIndex, setChosenIndex] = useState(-1);

    return (
        <Menu vertical fluid>
            {identities.map((identity: Identity, i: number) => (
                <Menu.Item
                    key={identity.id}
                    onClick={() => {
                        setReady(true);
                        setChosenIndex(i);
                        setIdentity(identity);
                    }}
                    active={chosenIndex === i}
                >
                    <IdentityListElement identity={identity} />
                </Menu.Item>
            ))}
        </Menu>
    );
}
