import React, { ReactElement, useMemo } from 'react';

import PageHeaderButton, { PageHeaderButtonProps } from './PageHeaderButton';

import styles from './PageHeader.module.scss';
import { AsProp } from '../../../utils/types';

export interface PageHeaderProps {
    children: ReactElement | ReactElement[];
}

function isPageHeaderButton(
    el: ReactElement
): el is ReactElement<PageHeaderButtonProps> {
    return (
        el.type === PageHeaderButton ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as ReactElement<AsProp<any>>).props.as === PageHeaderButton
    );
}

/**
 * @description
 * Used on pages as a header element inside <PageLayout />. Add buttons to the header by adding <PageLayout.HeaderButton /> as sub components.
 *
 * @example
 * <PageLayout>
 *   <PageLayout.Header>
 *     <PageLayout.HeaderButton align="left">-</PageLayout.HeaderButton>
 *     <h1>Title</h1>
 *     <ComposingComponent as={PageLayout.HeaderButton} align="left">+</ComposingComponent>
 *   </PageLayout.Header>
 *   ...
 * </PageLayout>
 */
export default function PageHeader({ children }: PageHeaderProps): JSX.Element {
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
