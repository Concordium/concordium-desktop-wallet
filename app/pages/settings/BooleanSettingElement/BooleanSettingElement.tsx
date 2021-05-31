import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import Card from '~/cross-app-components/Card';
import Switch from '~/cross-app-components/Switch';
import { updateSettingEntry } from '~/features/SettingsSlice';
import { Setting } from '~/utils/types';

import styles from './BooleanSettingElement.module.scss';

interface Props {
    displayText: string;
    setting: Setting;
    warning?: string;
}

/**
 * A component for a boolean setting that is updated by clicking a checkbox. If a
 * warning is provided, then a warning modal will be shown if enabling the setting.
 */
export default function BooleanSetting({
    displayText,
    setting,
    warning,
}: Props) {
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
        <Switch defaultChecked={setting.value === '1'} onClick={handleClick}>
            <span className="body1">{displayText}</span>
        </Switch>
    );

    const enableWarningModal = (
        <SimpleErrorModal
            show={open}
            header="Warning"
            content={warning}
            onClick={() => setOpen(false)}
        />
    );

    return (
        <Card className={styles.root}>
            {enableWarningModal}
            {toggleCheckbox}
        </Card>
    );
}

BooleanSetting.defaultProps = {
    warning: undefined,
};
