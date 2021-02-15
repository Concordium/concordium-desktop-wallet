import React, { ReactElement, useMemo } from 'react';

import PageHeaderButton, { PageHeaderButtonProps } from './PageHeaderButton';

import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
    children: ReactElement | ReactElement[];
}

function isPageHeaderButton(
    el: ReactElement
): el is ReactElement<PageHeaderButtonProps> {
    return el.type === PageHeaderButton;
}

function PageHeader({ children }: PageHeaderProps): JSX.Element {
    const { heading, rightButtons, leftButtons } = useMemo(() => {
        const reactChildren = React.Children.toArray(
            children
        ) as ReactElement[];

        return {
            heading: reactChildren.filter((c) => !isPageHeaderButton(c)),
            rightButtons: reactChildren.filter(
                (c) => isPageHeaderButton(c) && c.props.align === 'right'
            ),
            leftButtons: reactChildren.filter(
                (c) => isPageHeaderButton(c) && c.props.align === 'left'
            ),
        };
    }, [children]);

    return (
        <header className={styles.root}>
            <span className={styles.leftButtons}>{leftButtons}</span>
            {heading}
            <span className={styles.rightButtons}>{rightButtons}</span>
        </header>
    );
}

PageHeader.Button = PageHeaderButton;

export default PageHeader;
