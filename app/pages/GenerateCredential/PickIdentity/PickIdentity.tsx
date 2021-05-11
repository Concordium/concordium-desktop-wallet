import React, { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import PickIdentityView from '~/components/PickIdentity';
import ScrollContainer from '../ScrollContainer';
import { fieldNames } from '../types';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './PickIdentity.module.scss';
import savedStateContext from '../savedStateContext';

export default function PickIdentity(): JSX.Element {
    const { control } = useFormContext();
    const { identity } = useContext(savedStateContext);

    return (
        <ScrollContainer>
            <Controller
                control={control}
                defaultValue={identity ?? null}
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
