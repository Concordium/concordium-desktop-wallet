import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Checkbox, Form, Modal } from 'semantic-ui-react';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';

interface Props {
    setting: Setting;
    warning?: string;
}

/**
 * A component for a boolean setting that is updated by clicking a checkbox. If a
 * warning is provided, then a warning modal will be shown if enabling the setting.
 */
export default function BooleanSetting({ setting, warning }: Props) {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    function handleClick() {
        if (warning && setting.value === '0') {
            setOpen(true);
        }

        updateSettingEntry(dispatch, {
            ...setting,
            value: setting.value === '0' ? '1' : '0',
        });
    }

    const toggleCheckbox = (
        <Checkbox
            toggle
            label={setting.name}
            defaultChecked={setting.value === '1'}
            onClick={handleClick}
        />
    );

    const enableWarningModal = (
        <Modal open={open}>
            <Modal.Header>Warning</Modal.Header>
            <Modal.Content>{warning}</Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setOpen(false)}>Continue</Button>
            </Modal.Actions>
        </Modal>
    );

    return (
        <Form.Field>
            {enableWarningModal}
            {toggleCheckbox}
        </Form.Field>
    );
}

BooleanSetting.defaultProps = {
    warning: undefined,
};
