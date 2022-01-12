import React from 'react';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form';
import { getCurrentValue } from './util';
import { commonAddressValidators } from '~/utils/accountHelpers';

import styles from './FoundationAccount.module.scss';

export interface UpdateFoundationAccountFields {
    foundationAccount: string;
}

const fieldNames: EqualRecord<UpdateFoundationAccountFields> = {
    foundationAccount: 'foundationAccount',
};

export default function UpdateFoundationAccount({
    defaults,
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const currentFoundationAccount = getCurrentValue(blockSummary);

    return (
        <div>
            <div className="body3 mono mB10">
                Current address:
                <div className="body4">{currentFoundationAccount}</div>
            </div>
            <Form.TextArea
                className={styles.field}
                name={fieldNames.foundationAccount}
                defaultValue={defaults.foundationAccount}
                label="New foundation account address"
                placeholder="Paste the new account address here"
                rules={{
                    required: 'Please specify address',
                    ...commonAddressValidators,
                }}
            />
        </div>
    );
}
