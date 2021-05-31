import clsx from 'clsx';
import React, {
    forwardRef,
    InputHTMLAttributes,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import Label from '~/components/Label';
import Button from '~/cross-app-components/Button';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './FileInput.module.scss';

export interface FileInputRef {
    reset(): void;
}

export type FileInputValue = FileList | null;

export interface FileInputProps
    extends CommonInputProps,
        Pick<
            InputHTMLAttributes<HTMLInputElement>,
            'accept' | 'multiple' | 'placeholder' | 'disabled' | 'className'
        > {
    buttonTitle: string;
    value: FileInputValue;
    onChange(files: FileInputValue): void;
    disableFileNames?: boolean;
}

/**
 * @description
 * Component for handling file input. Parsing of file should be done externally. Supports drag and drop + click to browse.
 *
 * @example
 * <FileInput value={files} onChange={setFiles} />
 */
const FileInput = forwardRef<FileInputRef, FileInputProps>(
    (
        {
            value,
            onChange,
            label,
            isInvalid,
            error,
            placeholder,
            className,
            buttonTitle,
            disableFileNames = false,
            ...inputProps
        },
        ref
    ): JSX.Element => {
        const inputRef = useRef<HTMLInputElement>(null);
        const [dragOver, setDragOver] = useState<boolean>(false);
        const files = useMemo(
            () =>
                new Array(value?.length ?? 0)
                    .fill(0)
                    .map((_, i) => value?.item(i)),
            [value]
        );

        const { disabled } = inputProps;

        useImperativeHandle(ref, () => ({
            reset: () => {
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        }));

        return (
            <label
                className={clsx(
                    styles.root,
                    isInvalid && styles.invalid,
                    disabled && styles.disabled,
                    dragOver && styles.hovering,
                    className
                )}
                onDragOver={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
            >
                {label && <Label className={styles.label}>{label}</Label>}
                <div className={styles.wrapper}>
                    {files.length === 0 || disableFileNames
                        ? placeholder && (
                              <div className={styles.empty}>{placeholder}</div>
                          )
                        : files.map((f, i) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <div key={i} className={styles.fileName}>
                                  {f?.name}
                              </div>
                          ))}
                    <Button
                        className={styles.button}
                        size="tiny"
                        disabled={disabled}
                    >
                        {buttonTitle}
                    </Button>
                    <input
                        className={styles.input}
                        type="file"
                        onChange={(e) => onChange(e.target.files)}
                        ref={inputRef}
                        {...inputProps}
                    />
                </div>
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        );
    }
);

FileInput.displayName = 'FileInput';

export default FileInput;
