import clsx from 'clsx';
import React from 'react';
import Form from '~/components/Form';
import { EqualRecord } from '~/utils/types';

import generalStyles from '../AccountCreation.module.scss';
import styles from './PickName.module.scss';

interface Fields {
    name: string;
}

const fieldNames: EqualRecord<Fields> = {
    name: 'name',
};

interface Props {
    submitName: (name: string) => void;
    name: string | undefined;
}

// TODO: add Validation check on the name.
export default function IdentityIssuancePickName({
    submitName,
    name: initialName,
}: Props): JSX.Element {
    function submit({ name }: Fields) {
        submitName(name);
    }

    return (
        <div className={generalStyles.singleColumn}>
            <h2 className={generalStyles.header}>Naming your new account</h2>
            <div
                className={clsx(
                    generalStyles.singleColumnContent,
                    'flexColumn',
                    'flexChildFill'
                )}
            >
                <p>
                    The first step of creating a new account, is giving it a
                    name.
                </p>
                <p className={clsx(styles.label, 'mT100', 'marginCenter')}>
                    What would you like to name your identity?
                </p>
                <Form<Fields>
                    className="flexChildFill flexColumn justifySpaceBetween mT50 marginCenter"
                    onSubmit={submit}
                >
                    <Form.Input
                        className={clsx(styles.field, 'textBody2')}
                        name={fieldNames.name}
                        defaultValue={initialName}
                        placeholder="Account name"
                        rules={{ required: 'Please specify an account name' }}
                    />
                    <Form.Submit className={generalStyles.button}>
                        Let&apos;s continue
                    </Form.Submit>
                </Form>
            </div>
        </div>
    );
}
