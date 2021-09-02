import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import TabbedCard from './TabbedCard';
import { PropsOf } from '~/utils/types';

const { Tab } = TabbedCard;

export default {
    title: 'Components/TabbedCard',
    component: TabbedCard,
    subcomponents: { 'TabbedCard.Tab': Tab },
} as Meta;

const Template: Story<PropsOf<typeof TabbedCard>> = (a) => (
    <div style={{ width: 428 }}>
        <TabbedCard {...a} />
    </div>
);

export const TwoTabs = Template.bind({});
TwoTabs.args = {
    children: [
        <Tab key="1" header="first">
            This is some content
        </Tab>,
        <Tab key="2" header="second">
            This is different content
        </Tab>,
    ],
};

export const ThreeTabs = Template.bind({});
ThreeTabs.args = {
    children: [
        <Tab key="1" header="first">
            This is some content
        </Tab>,
        <Tab key="2" header="second">
            This is different content
        </Tab>,
        <Tab key="3" header="third">
            This is some completely different content. Even different from the
            already different second tab...
        </Tab>,
    ],
};
