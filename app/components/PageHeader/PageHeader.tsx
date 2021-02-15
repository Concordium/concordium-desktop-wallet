import React, { ReactElement } from 'react';

import PageHeaderButton, { PageHeaderButtonProps } from './PageHeaderButton';

import styles from './PageHeader.module.scss';

interface PageHeaderProps {
    children: ReactElement | ReactElement[];
}

export default function PageHeader({ children }: PageHeaderProps): JSX.Element {
    const reactChildren = React.Children.toArray(children) as ReactElement[];

    const rightButtons = reactChildren.filter(
        (c) =>
            c.type === PageHeaderButton &&
            (c.props as PageHeaderButtonProps).align === 'right'
    );
    const leftButtons = reactChildren.filter(
        (c) =>
            c.type === PageHeaderButton &&
            (c.props as PageHeaderButtonProps).align === 'left'
    );
    const heading = reactChildren.filter((c) => c.type !== PageHeaderButton);

    return (
        <header className={styles.root}>
            <span className={styles.leftButtons}>{leftButtons}</span>
            {heading}
            <span className={styles.rightButtons}>{rightButtons}</span>
        </header>
    );
}

PageHeader.Button = PageHeaderButton;
