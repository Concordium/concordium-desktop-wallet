import React, {
    ButtonHTMLAttributes,
    PropsWithChildren,
    useEffect,
    useState,
} from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import Modal, { ModalProps } from './Modal';

export default {
    title: 'Cross App Components/Modal',
    component: Modal,
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

type Props = PropsWithChildren<
    ModalProps<ButtonHTMLAttributes<HTMLButtonElement>>
>;
const Template: Story<Props> = (args) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(args.open);
    }, [args.open]);

    return (
        <Modal
            {...args}
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
        />
    );
};

export const Primary = Template.bind({});
Primary.args = {
    children: 'Modal content...',
    open: true,
};

export const WithTrigger = Template.bind({});
WithTrigger.args = {
    children: 'Modal content...',
    open: false,
    trigger: <button type="button">Click me</button>,
};

export const WithoutClose = Template.bind({});
WithoutClose.args = {
    children: 'Modal content...',
    disableClose: true,
    open: true,
};
