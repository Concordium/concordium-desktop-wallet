import clsx from 'clsx';
import React, { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import PageContainer from './PageContainer';

import PageHeader, { PageHeaderProps } from './PageHeader/PageHeader';
import PageHeaderButton from './PageHeader/PageHeaderButton';
import styles from './PageLayout.module.scss';

function isPageHeader(el: ReactElement): el is ReactElement<PageHeaderProps> {
    return el.type === PageHeader;
}

interface PageLayoutProps {
    /**
     * Whether or not to include gutter for content. Useful if using in combination with \<Columns /\> to avoid double gutter. Defaults to false.
     */
    noGutter?: boolean;
    /**
     * Removes max width limitation of content. Defaults to false.
     */
    noMaxWidth?: boolean;
}

/**
 * @description
 * Used on all pages to get consistent layout.
 *
 * @example
 * <PageLayout>
 *   <PageLayout.Header>Page title</PageLayout.Header>
 *   Page content
 * <PageLayout>
 */
function PageLayout({
    children,
    noGutter = false,
    noMaxWidth = false,
}: PropsWithChildren<PageLayoutProps>): JSX.Element {
    const { content, header } = useMemo(() => {
        const reactChildren = React.Children.toArray(
            children
        ) as ReactElement[];

        return {
            content: reactChildren.filter((c) => !isPageHeader(c)),
            header: reactChildren.find((c) => isPageHeader(c)),
        };
    }, [children]);

    return (
        <article className={styles.root}>
            {header && <span className={styles.header}>{header}</span>}
            <section
                className={clsx(
                    styles.content,
                    noGutter && styles.noGutter,
                    noMaxWidth && styles.noMaxWidth
                )}
            >
                {content}
            </section>
        </article>
    );
}

PageLayout.Header = PageHeader;
(PageLayout.Header as FC).displayName = 'PageLayout.Header';

PageLayout.HeaderButton = PageHeaderButton;
(PageLayout.HeaderButton as FC).displayName = 'PageLayout.HeaderButton';

PageLayout.Container = PageContainer;
(PageLayout.Container as FC).displayName = 'PageLayout.Container';

export default PageLayout;
