import React from 'react';
import Button, { ButtonProps } from '~/cross-app-components/Button';
import Label from '../Label';
import styles from './ButtonGroup.module.scss';

interface Element {
    label: string;
}

interface Props<T> {
    buttons: T[];
    isSelected: (button: T) => boolean;
    title: string;
    name: string;
    buttonClassName?: string;
    onClick: (value: T) => void;
}

/**
 * @description
 */
export default function Group<T extends Element>({
    title,
    isSelected,
    buttons,
    name,
    buttonClassName,
    onClick,
    ...props
}: Omit<ButtonProps, 'as' | 'onClick'> & Props<T>): JSX.Element {
    return (
        <div className={styles.buttonGroup}>
            <Label className={styles.title}>{title}</Label>
            <div className={styles.buttons}>
                {buttons.map((button) => (
                    <Button
                        key={button.label}
                        name={name}
                        inverted={!isSelected(button)}
                        className={buttonClassName}
                        {...props}
                        onClick={() => onClick(button)}
                    >
                        {button.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
