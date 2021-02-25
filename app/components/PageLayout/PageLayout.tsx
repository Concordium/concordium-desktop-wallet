import React, { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import PageContainer from './PageContainer';

import PageHeader, { PageHeaderProps } from './PageHeader/PageHeader';
import styles from './PageLayout.module.scss';

function isPageHeader(el: ReactElement): el is ReactElement<PageHeaderProps> {
    return el.type === PageHeader;
}

export interface PageLayoutProps {
    children: ReactElement | ReactElement[];
}

function PageLayout({ children }: PropsWithChildren<unknown>): JSX.Element {
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
            <section className={styles.content}>{content}</section>
        </article>
    );
}

PageLayout.Header = PageHeader;
(PageLayout.Header as FC).displayName = 'PageLayout.Header';
(PageLayout.Header.Button as FC).displayName = 'PageLayout.Header.Button';

PageLayout.Container = PageContainer;
(PageLayout.Container as FC).displayName = 'PageLayout.Container';

export default PageLayout;
