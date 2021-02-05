import React from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input } from 'semantic-ui-react';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';

interface Props {
    setting: Setting;
}

/**
 * A component for a text setting that is updated automatically on changes.
 */
export default function TextSetting({ setting }: Props) {
    const dispatch = useDispatch();

    // Ideally this should have a debounce, so that we wait a little before actually
    // storing to the database. As we are uncertain if there will be a submit button
    // or not, we will keep it as is for now.
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        return updateSettingEntry(dispatch, {
            ...setting,
            value: event.target.value,
        });
    }

    return (
        <Form.Field>
            <Input
                label={setting.name}
                defaultValue={setting.value}
                onChange={handleChange}
            />
        </Form.Field>
    );
}
