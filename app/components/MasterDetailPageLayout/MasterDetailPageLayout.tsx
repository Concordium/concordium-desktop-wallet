import React, {
    Children,
    PropsWithChildren,
    ReactElement,
    useMemo,
} from 'react';
import Columns from '../Columns';

import PageLayout from '../PageLayout';

import styles from './MasterDetailPageLayout.module.scss';

const { Header } = PageLayout;
const Master = ({ children }: PropsWithChildren<unknown>) => (
    <Columns.Column verticalPadding className={styles.master}>
        <div className={styles.halfMaxWidth}>
            <div className={styles.column}>{children}</div>
        </div>
    </Columns.Column>
);
const Detail = ({ children }: PropsWithChildren<unknown>) => (
    <Columns.Column verticalPadding className={styles.detail}>
        <div className={styles.halfMaxWidth}>
            <div className={styles.column}>{children}</div>
        </div>
    </Columns.Column>
);

function isPageHeader(el: ReactElement): boolean {
    return el.type === Header;
}

interface MasterDetailPageLayoutProps {
    /**
     * <MasterDetailPageLayout.Header />, (<MasterDetailPageLayout.Master />, <MasterDetailPageLayout.Detail />) | </>
     */
    children:
        | [ReactElement, ReactElement]
        | [ReactElement, ReactElement, ReactElement];
}

/**
 * @description
 * To be used on all master/detail pages.
 *
 * @example
 * const { Header, Master, Detail } = MasterDetailPageLayout;
 *
 * <MasterDetailPageLayout>
 *   <Header><h1>Page heading</h1></Header>
 *   <Master>{links.map(Component)}</Master>
 *   <Detail><DetailView /></Detail> // Typically <DetailView /> would be a Router of some sort...
 * </MasterDetailPageLayout>
 */
export default function MasterDetailPageLayout({
    children,
}: MasterDetailPageLayoutProps): JSX.Element {
    const { content, header } = useMemo(() => {
        const reactChildren = Children.toArray(children) as ReactElement[];

        return {
            content: reactChildren.filter((c) => !isPageHeader(c)),
            header: reactChildren.find((c) => isPageHeader(c)),
        };
    }, [children]);

    const isColumnsContent =
        content.every((c) => c.type === Master || c.type === Detail) &&
        content.length === 2;

    return (
        <PageLayout noGutter noMaxWidth>
            {header}
            {isColumnsContent ? (
                <Columns
                    divider="inset"
                    className={styles.columns}
                    columnScroll
                >
                    {content}
                </Columns>
            ) : (
                content
            )}
        </PageLayout>
    );
}

MasterDetailPageLayout.Header = Header;
MasterDetailPageLayout.Master = Master;
MasterDetailPageLayout.Detail = Detail;
