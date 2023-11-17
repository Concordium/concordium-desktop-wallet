import React from 'react';
import { Validate } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Form from '~/components/Form';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { accountInfoSelector } from '~/features/AccountSlice';
import {
    getExistingBakerValues,
    MetadataUrl,
} from '~/utils/transactionFlows/configureBaker';
import { Account, EqualRecord } from '~/utils/types';
import { isASCII } from '~/utils/basicHelpers';

import styles from './ConfigureBakerPage.module.scss';

const MAX_SERIALIZED_URL_LENGTH = 2048;
const validateSerializedLength: Validate = (v: string) =>
    v === undefined ||
    new TextEncoder().encode(v).length < MAX_SERIALIZED_URL_LENGTH ||
    `The URL exceeds the maximum length of ${MAX_SERIALIZED_URL_LENGTH} (serialized into UTF-8)`;

const validateASCII: Validate = (v: string) =>
    v === undefined || isASCII(v) || 'Url contains non-ascii characters';

interface MetadataUrlPageForm {
    url: MetadataUrl;
}

const metadataUrlPageFieldNames: EqualRecord<MetadataUrlPageForm> = {
    url: 'url',
};

interface MetadataUrlPageProps
    extends Omit<MultiStepFormPageProps<MetadataUrl>, 'formValues'> {
    account: Account;
}

const MetadataUrlPage = ({
    onNext,
    initial,
    account,
}: MetadataUrlPageProps) => {
    const accountInfo = useSelector(accountInfoSelector(account));
    const { metadataUrl: existing } = getExistingBakerValues(accountInfo) ?? {};

    return (
        <Form<MetadataUrlPageForm>
            onSubmit={(v) => onNext(v.url)}
            className="flexColumn flexChildFill"
        >
            <div className="flexChildFill">
                <p className="mT0">
                    You can choose to add a URL with metadata about your
                    validator. Leave it blank if you don&apos;t have any.
                </p>
                <div className="mT50">
                    {existing !== undefined && (
                        <div className="body3 mono mB10">
                            Current url:
                            <br />
                            {existing || (
                                <span className="textFaded">Empty</span>
                            )}
                        </div>
                    )}
                    <Form.Input
                        name={metadataUrlPageFieldNames.url}
                        defaultValue={initial ?? existing}
                        className="body2"
                        placeholder="Enter metadata URL"
                        rules={{
                            validate: {
                                length: validateSerializedLength,
                                isACII: validateASCII,
                            },
                        }}
                    />
                </div>
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
};

export default MetadataUrlPage;
