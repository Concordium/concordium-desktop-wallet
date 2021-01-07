import React from 'react';
import { useSelector } from 'react-redux';
import {
    chosenIndexSelector,
    settingsSelector,
} from '../features/SettingsSlice';
import { Setting } from '../utils/types';
import BooleanSetting from '../components/settings/BooleanSettingElement';

// TODO The styling is to be updated at some point. This is just a placeholder that can safely be exchanged.
import styles from './Identity.css';

export default function SettingsView() {
    const settings = useSelector(settingsSelector);
    const chosenIndex = useSelector(chosenIndexSelector);

    if (chosenIndex === undefined) {
        return <div />;
    }
    
    return (
        <div className={styles.halfPage}>
            {settings[chosenIndex].settings.map((childSetting: Setting, i) => (
                
                <BooleanSetting setting={childSetting} key={childSetting.name} />   

            ))}
        </div>
    );
}
