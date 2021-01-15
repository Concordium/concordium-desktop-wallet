import React from 'react';
import { useSelector } from 'react-redux';
import {
    chosenIndexSelector,
    settingsSelector,
} from '../../features/SettingsSlice';
import { Setting, SettingTypeEnum } from '../../utils/types';

import styles from './Settings.css';
import BooleanSetting from './BooleanSettingElement';
import TextSetting from './TextSettingElement';

export default function SettingsView() {
    const settings = useSelector(settingsSelector);
    const chosenIndex = useSelector(chosenIndexSelector);

    if (chosenIndex === undefined) {
        return null;
    }

    return (
        <div className={styles.halfPage}>
            {settings[chosenIndex].settings.map((childSetting: Setting) => {
                switch (childSetting.type) {
                    case SettingTypeEnum.Boolean:
                        return (
                            <BooleanSetting
                                setting={childSetting}
                                key={childSetting.name}
                            />
                        );
                    case SettingTypeEnum.Text:
                        return (
                            <TextSetting
                                setting={childSetting}
                                key={childSetting.name}
                            />
                        );
                    default:
                        return '';
                }
            })}
        </div>
    );
}
