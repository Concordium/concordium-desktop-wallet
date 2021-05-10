import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import PickIdentityView from '~/components/PickIdentity';
import ScrollContainer from '../ScrollContainer';
import { fieldNames } from '../types';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './PickIdentity.module.scss';

export default function PickIdentity(): JSX.Element {
    const { control } = useFormContext();

    return (
        <ScrollContainer>
            <Controller
                control={control}
                name={fieldNames.identity}
                rules={{ required: true }}
                render={({ value, onChange, onBlur }) => (
                    <PickIdentityView
                        className={clsx(generalStyles.card, styles.root)}
                        chosenIdentity={value}
                        setIdentity={(i) => {
                            onChange(i);
                            onBlur();
                        }}
                    />
                )}
            />
        </ScrollContainer>
    );
}
