import React from 'react';
import { useSelector } from 'react-redux';
import { Form } from 'semantic-ui-react';
import {
    chosenIndexSelector,
    settingsSelector,
} from '../../features/SettingsSlice';
import { Setting, SettingTypeEnum } from '../../utils/types';
import BooleanSetting from './BooleanSettingElement';
import TextSetting from './TextSettingElement';
import ConnectionSettingElement from './ConnectionSettingElement';
import settingKeys from '../../constants/settingKeys.json';

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
    [settingKeys.nodeLocation, 'Node location'],
]);

export default function SettingsView() {
    const settings = useSelector(settingsSelector);
    const chosenIndex = useSelector(chosenIndexSelector);

    if (chosenIndex === undefined || settings[chosenIndex] === undefined) {
        return null;
    }

    return (
        <Form>
            {settings[chosenIndex].settings.map((childSetting: Setting) => {
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
                    case SettingTypeEnum.Text:
                        return (
                            <TextSetting
                                setting={childSetting}
                                key={childSetting.name}
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
        </Form>
    );
}
