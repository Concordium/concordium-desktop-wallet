import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import wrapperStyles from '~/shell/Notifications/Notifications.module.scss';

import { NotificationLevel } from '~/features/NotificationSlice';
import Notification, { NotificationProps } from './Notification';

export default {
    title: 'Components/Notification',
    component: Notification,
} as Meta;

const Template: Story<NotificationProps> = (args) => (
    <div className={wrapperStyles.root}>
        <Notification {...args} />
    </div>
);

export const Info = Template.bind({});
Info.args = {
    level: NotificationLevel.Info,
    children: 'This is a notification!',
};

export const Error = Template.bind({});
Error.args = {
    level: NotificationLevel.Error,
    children: 'This is a dangerous notification!',
};
