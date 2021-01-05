import React from 'react';
import { useSelector } from 'react-redux';
import { chosenSettingSelector } from '../features/SettingsSlice';
import { Setting } from '../utils/types';

// TODO Fix this
import styles from './Identity.css';

export default function SettingsView() {
    const chosenSettings = useSelector(chosenSettingSelector);

    if (chosenSettings === undefined) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            {chosenSettings.settings.map((childSetting: Setting) => (
                <div key={childSetting.name}>
                    <h1>
                        {childSetting.name} - {childSetting.value}
                    </h1>
                </div>
            ))}
        </div>
    );
}
