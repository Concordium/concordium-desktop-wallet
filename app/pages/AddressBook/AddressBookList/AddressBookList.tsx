import React from 'react';
import AddressBookEntryIcon from '@resources/svg/identity.svg';

import ButtonNavLink from '~/components/ButtonNavLink';
import { selectedAddressBookEntryRoute } from '~/utils/routerHelper';
import AddressBookSearchList from '~/components/AddressBookSearchList';

import styles from './AddressBookList.module.scss';

export default function AddressBookList(): JSX.Element {
    return (
        <AddressBookSearchList>
            {(e) => (
                <ButtonNavLink
                    className={styles.item}
                    key={e.address}
                    icon={
                        <AddressBookEntryIcon className={styles.identityIcon} />
                    }
                    to={selectedAddressBookEntryRoute(e.address)}
                >
                    {e.name}
                </ButtonNavLink>
            )}
        </AddressBookSearchList>
    );
}
