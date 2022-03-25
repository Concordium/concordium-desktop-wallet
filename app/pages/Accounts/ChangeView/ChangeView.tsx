import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Arrows from '@resources/svg/arrows-switch.svg';
import { toggleAccountView } from '~/features/AccountSlice';
import { RootState } from '~/store/store';

import styles from './ChangeView.module.scss';

export default function ChangeView() {
    const dispatch = useDispatch();
    const viewingList = useSelector((s: RootState) => s.accounts.simpleView);
    const toggle = () => toggleAccountView(dispatch);
    const text = viewingList ? 'More options' : 'Account list';

    return (
        <button className={styles.root} type="button" onClick={toggle}>
            <em className={styles.text}>{text}</em>
            <Arrows />
        </button>
    );
}
