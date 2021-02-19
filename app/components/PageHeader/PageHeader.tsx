import React, { ReactElement, useMemo } from 'react';

import PageHeaderButton, { PageHeaderButtonProps } from './PageHeaderButton';

import styles from './PageHeader.module.scss';
import { WithAsProp } from '../../utils/types';

export interface PageHeaderProps {
    children: ReactElement | ReactElement[];
}

function isPageHeaderButton(
    el: ReactElement
): el is ReactElement<PageHeaderButtonProps> {
    return (
        el.type === PageHeaderButton ||
        (el as ReactElement<WithAsProp<unknown>>).props.as === PageHeaderButton
    );
}

/**
 * @description
 * Used on pages as a header element. Add buttons to the header by adding <PageHeader.Button /> as sub components.
 *
 * @example
 * <PageHeader>
 *   <PageHeader.Button align="left">-</PageHeader.Button>
 *   <h1>Title</h1>
 *   <ComposingComponent as={PageHeader.Button} align="left">+</ComposingComponent>
 * </PageHeader>
 */
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
