import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSettings, settingsSelector } from '../features/SettingsSlice';

// TODO Fix this.
import styles from './Identity.css';

export default function SettingsList() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

    return (
        <div className={styles.halfPage}>
            {settings.map((setting, i) => (
                <div
                    role="button"
                    tabIndex={i}
                    onClick={() => selectSettings(dispatch, i)}
                    key={setting.type}
                >
                    <h1>{setting.type}</h1>
                </div>
            ))}
        </div>
    );
}
