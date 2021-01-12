import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    chosenIndexSelector,
    settingsSelector,
    updateSettingEntry,
} from '../features/SettingsSlice';
import { Setting } from '../utils/types';

// TODO Fix this
import styles from './Identity.css';

export default function SettingsView() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const chosenIndex = useSelector(chosenIndexSelector);

    if (chosenIndex === undefined) {
        return <div />;
    }

    return (
        <div className={styles.halfPage}>
            {settings[chosenIndex].settings.map((childSetting: Setting, i) => (
                <div
                    role="button"
                    tabIndex={i}
                    onClick={() => {
                        // TODO Editing of settings is not going to be a switch like this, as not all settings are
                        // booleans. We might have to add types on the settings, so that we know which type of
                        // editing they support.
                        return updateSettingEntry(dispatch, {
                            ...childSetting,
                            value: (childSetting.value === 'false').toString(),
                        });
                    }}
                    key={childSetting.name}
                >
                    <h1>
                        {childSetting.name} - {childSetting.value}
                    </h1>
                </div>
            ))}
        </div>
    );
}
