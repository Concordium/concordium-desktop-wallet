import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import FileInput, { FileInputProps } from './FileInput';

export default {
    title: 'Components/Form/Fields/File Input',
    component: FileInput,
} as Meta;

const Template: Story<FileInputProps> = (args) => {
    const [files, setFiles] = useState<FileList | null>(args.value);

    return <FileInput {...args} onChange={setFiles} value={files} />;
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'File Input',
    buttonTitle: 'Browse to file',
};

export const Multiple = Template.bind({});
Multiple.args = {
    label: 'Files Input',
    placeholder: 'No files in field yet...',
    buttonTitle: 'Browse to file',
    multiple: true,
};

export const Placeholder = Template.bind({});
Placeholder.args = {
    label: 'File Input',
    placeholder: 'No files in field yet...',
    buttonTitle: 'Browse to file',
};

export const Disabled = Template.bind({});
Disabled.args = {
    label: 'File Input',
    placeholder: 'No files in field yet...',
    buttonTitle: 'Browse to file',
    disabled: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'File Input',
    buttonTitle: 'Browse to file',
    isInvalid: true,
    error: 'File is required',
};
