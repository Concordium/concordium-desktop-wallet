import React from 'react';
import styles from './Pages.css';
import SettingsList from '../components/SettingsList';
import SettingsView from '../components/SettingsView';

export default function SettingsPage() {
    return (
        <div className={styles.splitPage}>
            <SettingsList />
            <SettingsView />
        </div>
    );
}
