import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../../cross-app-components/Button';
import {
    chooseIndex,
    addressBookSelector,
    chosenIndexSelector,
} from '../../../features/AddressBookSlice';
import IdentityIcon from '../../../../resources/svg/identity.svg';

import styles from './AddressBookList.module.scss';

export default function AddressBookList(): JSX.Element {
    const dispatch = useDispatch();
    const chosenIndex = useSelector(chosenIndexSelector);
    const addressBook = useSelector(addressBookSelector);

    return (
        <>
            {addressBook.map((e, i) => (
                <Button
                    className={styles.item}
                    key={e.address}
                    size="huge"
                    onClick={() => dispatch(chooseIndex(i))}
                    inverted
                    active={i === chosenIndex}
                    icon={<IdentityIcon className={styles.identityIcon} />}
                >
                    {e.name}
                </Button>
            ))}
        </>
    );
}
