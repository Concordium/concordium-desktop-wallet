import React from 'react';
import { useDispatch } from 'react-redux';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';

import styles from './Settings.css';

interface Props {
    setting: Setting;
}

/**
 * A component for a boolean setting that is updated by clicking a checkbox.
 */
export default function BooleanSetting({ setting }: Props) {
    const dispatch = useDispatch();

    function handleClick() {
        return updateSettingEntry(dispatch, {
            ...setting,
            value: setting.value === '0' ? '1' : '0',
        });
    }

    return (
        <div>
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    onClick={() => handleClick()}
                    defaultChecked={setting.value === '1'}
                />
                <span className={styles.slider} />
                <h3>{setting.name}</h3>
            </label>
        </div>
    );
}
