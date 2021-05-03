import React from 'react';

import clsx from 'clsx';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form';

import styles from './FoundationAccount.module.scss';
import { getCurrentValue } from './util';
import { commonAddressValidators } from '~/utils/accountHelpers';

export interface UpdateFoundationAccountFields {
    foundationAccount: string;
}

const fieldNames: EqualRecord<UpdateFoundationAccountFields> = {
    foundationAccount: 'foundationAccount',
};

export default function UpdateFoundationAccount({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const currentFoundationAccount = getCurrentValue(blockSummary);

    return (
        <>
            <div>
                <h5 className="mB0">Current foundation account address:</h5>
                <div className={clsx(styles.accountAddress, 'textFaded')}>
                    {currentFoundationAccount}
                </div>
            </div>
            <Form.TextArea
                className={styles.field}
                name={fieldNames.foundationAccount}
                label="New foundation account address:"
                placeholder="Paste the new account address here"
                rules={{
                    required: 'Please specify address',
                    ...commonAddressValidators,
                }}
            />
        </>
    );
}
