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
};

export const Placeholder = Template.bind({});
Placeholder.args = {
    label: 'File Input',
    placeholder: 'No files in field yet...',
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'File Input',
    isInvalid: true,
    error: 'File is required',
};
