import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  chooseIdentity,
  identities,
  chosenIdentity,
} from '../features/accounts/accountsSlice.ts';
import styles from './Accounts.css';

export default function IdentityPage() {
  const dispatch = useDispatch();
  const identity_list = useSelector(identities);
  const chosenIndex = useSelector(chosenIdentity);

  return (
    <div>
      {identity_list.map((identity, i) => (
        <div
          onClick={() => dispatch(chooseIdentity(i))}
          key={i}
          className={i == chosenIndex ? styles.chosen : styles.nonChosen}
        >
          {identity.name}
        </div>
      ))}
    </div>
  );
}
