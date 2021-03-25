import clsx from 'clsx';
import React, { InputHTMLAttributes, useMemo } from 'react';
import Button from '~/cross-app-components/Button';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './FileInput.module.scss';

export type FileInputValue = FileList | null;

export interface FileInputProps
    extends CommonInputProps,
        Pick<InputHTMLAttributes<HTMLInputElement>, 'accept' | 'multiple'> {
    value: FileInputValue;
    onChange(files: FileInputValue): void;
}

/**
 * @description
 * Component for handling file input. Parsing of file should be done externally. Supports drag and drop + click to browse.
 *
 * @example
 * <FileInput value={files} onChange={setFiles} />
 */
export default function FileInput({
    value,
    onChange,
    label,
    isInvalid,
    error,
    ...inputProps
}: FileInputProps): JSX.Element {
    const files = useMemo(
        () =>
            new Array(value?.length ?? 0).fill(0).map((_, i) => value?.item(i)),
        [value]
    );

    return (
        <label className={clsx(styles.root, isInvalid && styles.invalid)}>
            {label && <span className={styles.label}>{label}</span>}
            <div className={styles.wrapper}>
                {files.length === 0 ? (
                    <div className={styles.empty}>No file in field</div>
                ) : (
                    files.map((f, i) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={i} className={styles.fileName}>
                            {f?.name}
                        </div>
                    ))
                )}
                <Button className={styles.button} size="tiny">
                    Browse to file, or drop it here
                </Button>
                <input
                    className={styles.input}
                    type="file"
                    onChange={(e) => onChange(e.target.files)}
                    {...inputProps}
                />
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </label>
    );
}
