import React from 'react';
import { Validate } from 'react-hook-form';
import Form from '~/components/Form';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { MetadataUrl } from '~/utils/transactionFlows/configureBaker';
import { EqualRecord } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

const MAX_SERIALIZED_URL_LENGTH = 2048;
const validateSerializedLength: Validate = (v: string) =>
    v === undefined ||
    new TextEncoder().encode(v).length < MAX_SERIALIZED_URL_LENGTH ||
    `The URL exceeds the maximum length of ${MAX_SERIALIZED_URL_LENGTH} (serialized into UTF-8)`;

interface MetadataUrlPageForm {
    url: MetadataUrl;
}

const metadataUrlPageFieldNames: EqualRecord<MetadataUrlPageForm> = {
    url: 'url',
};

type MetadataUrlPageProps = Omit<
    MultiStepFormPageProps<MetadataUrl>,
    'formValues'
>;

const MetadataUrlPage = ({ onNext, initial = '' }: MetadataUrlPageProps) => (
    <Form<MetadataUrlPageForm>
        onSubmit={(v) => onNext(v.url)}
        className="flexColumn flexChildFill"
    >
        <div className="flexChildFill">
            <p>
                You can choose to add a URL with metadata about your baker.
                Leave it blank if you don&apos;t have any.
            </p>
            <Form.Input
                name={metadataUrlPageFieldNames.url}
                defaultValue={initial}
                className="body2"
                placeholder="Enter metadata URL"
                rules={{
                    validate: validateSerializedLength,
                }}
            />
        </div>
        <Form.Submit className={styles.continue}>Continue</Form.Submit>
    </Form>
);

export default MetadataUrlPage;
