import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import Modal, { ModalProps } from './Modal';

export default {
    title: 'Cross App Components/Modal',
    component: Modal,
    argTypes: {
        trigger: {
            description: 'Element with onClick prop, such as "button"',
        },
    },
    decorators: [
        (story) => (
            <>
                <style>
                    {`
                        #main-layout {
                            position: relative;
                            width: 100%;
                            height: 600px;
                        }
                    `}
                </style>
                <div id="main-layout">{story()}</div>
            </>
        ),
    ],
} as Meta;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = PropsWithChildren<
    ModalProps<ButtonHTMLAttributes<HTMLButtonElement>>
>;
const Template: Story<Props> = (args) => <Modal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    trigger: <button type="button">Click me</button>,
    children: 'Modal content...',
};

export const WithoutClose = Template.bind({});
WithoutClose.args = {
    trigger: <button type="button">Click me</button>,
    children: 'Modal content...',
    disableClose: true,
};
