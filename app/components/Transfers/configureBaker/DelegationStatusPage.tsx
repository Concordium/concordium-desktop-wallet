import React, { useState } from 'react';
import Radios from '~/components/Form/Radios';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import Button from '~/cross-app-components/Button';
import { OpenStatus } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

type DelegationStatusPageProps = Omit<
    MultiStepFormPageProps<OpenStatus>,
    'formValues'
>;

export default function DelegationStatusPage({
    initial = OpenStatus.OpenForAll,
    onNext,
}: DelegationStatusPageProps) {
    const [value, setValue] = useState(initial);
    return (
        <>
            <div className="flexChildFill">
                <p>
                    You have the option to open your baker as a pool for others
                    to delegate their CCD to.
                </p>
                <Radios
                    className="mT50"
                    options={[
                        { label: 'Open pool', value: OpenStatus.OpenForAll },
                        {
                            label: 'Keep closed',
                            value: OpenStatus.ClosedForAll,
                        },
                    ]}
                    value={value}
                    onChange={setValue}
                />
            </div>
            <Button className={styles.continue} onClick={() => onNext(value)}>
                Continue
            </Button>
        </>
    );
}
