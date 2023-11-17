import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Radios from '~/components/Form/Radios';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { accountInfoSelector } from '~/features/AccountSlice';
import { isDefined } from '~/utils/basicHelpers';
import {
    displayPoolOpen,
    getExistingBakerValues,
} from '~/utils/transactionFlows/configureBaker';
import { Account, OpenStatus } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

interface DelegationStatusPageProps
    extends Omit<MultiStepFormPageProps<OpenStatus>, 'formValues'> {
    account: Account;
}

export default function DelegationStatusPage({
    initial,
    onNext,
    account,
}: DelegationStatusPageProps) {
    const accountInfo = useSelector(accountInfoSelector(account));
    const { openForDelegation: existing } =
        getExistingBakerValues(accountInfo) ?? {};
    const [value, setValue] = useState(
        initial ?? existing ?? OpenStatus.OpenForAll
    );

    return (
        <>
            <div className="flexChildFill">
                <p>
                    You have the option to open your validator as a pool for
                    others to delegate their CCD to.
                </p>
                <div className="mT50">
                    {existing !== undefined && (
                        <div className="body3 mono mB10">
                            Current option: {displayPoolOpen(existing)}
                        </div>
                    )}
                    <Radios
                        options={[
                            {
                                label: 'Open',
                                value: OpenStatus.OpenForAll,
                            },
                            existing !== undefined
                                ? {
                                      label: 'Closed for new',
                                      value: OpenStatus.ClosedForNew,
                                  }
                                : undefined,
                            {
                                label:
                                    existing !== undefined
                                        ? 'Closed for all'
                                        : 'Closed',
                                value: OpenStatus.ClosedForAll,
                            },
                        ].filter(isDefined)}
                        value={value}
                        onChange={setValue}
                    />
                </div>
            </div>
            <Button className={styles.continue} onClick={() => onNext(value)}>
                Continue
            </Button>
        </>
    );
}
