import React from 'react';
import IdentityList from '../components/IdentityList';
import IdentityView from '../components/IdentityView';
import styles from './Pages.css';

export default function IdentityPage() {
    return (
        <div className={styles.splitPage}>
            <IdentityList />
            <IdentityView />
        </div>
    );
}
