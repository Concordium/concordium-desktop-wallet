import React from 'react';
import styles from './Pages.css';
import SettingsList from '../components/settings/SettingsList';
import SettingsView from '../components/settings/SettingsView';

export default function SettingsPage() {
    return (
        <div className={styles.splitPage}>
            <SettingsList />
            <SettingsView />
        </div>
    );
}
