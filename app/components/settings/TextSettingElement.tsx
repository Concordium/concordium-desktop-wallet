import React from 'react';
import { useDispatch } from 'react-redux';
import { updateSettingEntry } from '../../features/SettingsSlice';

/**
 * A component for boolean settings that are updated by clicking the 
 * setting.
 * @param props containing a Boolean setting
 */
export default function TextSetting(props: any) {
    const dispatch = useDispatch();

    let setting = props.setting;
    let settingValue = setting.value;

    function handleChange(event) {
        return updateSettingEntry(dispatch, {
            ...setting,
            value: event.target.value,
        });
    }

    return (
        <div>
            <input type="text" defaultValue={settingValue} onChange={(e) => handleChange(e)} />
        </div>
    );
}
