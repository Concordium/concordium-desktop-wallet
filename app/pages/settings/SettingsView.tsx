import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { settingsSelector } from '../../features/SettingsSlice';
import settingKeys from '../../constants/settingKeys.json';
import { Setting, SettingTypeEnum } from '~/utils/types';
import BooleanSetting from './BooleanSettingElement';
import ConnectionSettingElement from './ConnectionSettingElement';

// A static definition of warning messages, where the key matches the
// setting name that the warning is for.
const warningMessages = new Map<string, string>([
    [
        settingKeys.foundationTransactionsEnabled,
        'Foundation transactions cannot be validly signed by anyone other than the foundation. If you are not part of the foundation, then you should keep this setting disabled.',
    ],
]);

const settingDisplayTexts = new Map<string, string>([
    [settingKeys.foundationTransactionsEnabled, 'Foundation transactions'],
    [settingKeys.nodeLocation, 'Node connection settings'],
]);

export default function SettingsView() {
    const { type } = useParams<{ type: string }>();

    const settings = useSelector(settingsSelector);
    const subSettings = settings.find((subSetting) => subSetting.type === type);
    if (!subSettings) {
        throw new Error(`An invalid type of setting was selected: ${type}`);
    }

    return (
        <>
            {subSettings.settings.map((childSetting: Setting) => {
                const settingDisplayText = settingDisplayTexts.get(
                    childSetting.name
                );
                if (!settingDisplayText) {
                    throw new Error(
                        'A setting without a display text was encountered.'
                    );
                }
                let warning: string | undefined;

                switch (childSetting.type) {
                    case SettingTypeEnum.Boolean:
                        warning = warningMessages.get(childSetting.name);
                        return (
                            <BooleanSetting
                                displayText={settingDisplayText}
                                setting={childSetting}
                                key={childSetting.name}
                                warning={warning}
                            />
                        );
                    case SettingTypeEnum.Connection:
                        return (
                            <ConnectionSettingElement
                                displayText={settingDisplayText}
                                setting={childSetting}
                                key={childSetting.name}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
}
