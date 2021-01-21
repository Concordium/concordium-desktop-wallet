import React from 'react';
import { useDispatch } from 'react-redux';
import { Checkbox, Form } from 'semantic-ui-react';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';

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
        <Form.Field>
            <Checkbox
                toggle
                label={setting.name}
                defaultChecked={setting.value === '1'}
                onClick={handleClick}
            />
        </Form.Field>
    );
}
