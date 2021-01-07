import React from 'react';
import { useDispatch } from 'react-redux';
import { updateSettingEntry } from '../../features/SettingsSlice';

/**
 * A component for boolean settings that are updated by clicking the 
 * setting.
 * @param props containing a Boolean setting
 */
export default function BooleanSetting(props: any) {
    const dispatch = useDispatch();

    let setting = props.setting;
    let settingName = setting.name;
    let settingValue = setting.value;

    function handleClick() {
        return updateSettingEntry(dispatch, {
            ...setting,
            value: (setting.value === 'false').toString()
        });
    }

    return (
        <div role="button" onClick={() => handleClick()}>
            <h1>{settingName} - {settingValue}</h1>
        </div>
    );
}
