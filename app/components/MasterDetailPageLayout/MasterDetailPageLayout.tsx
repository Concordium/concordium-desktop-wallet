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
const Column = (props: PropsWithChildren<unknown>) => (
    <Columns.Column verticalPadding {...props} />
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
        content.every((c) => c.type === Column) && content.length === 2;

    return (
        <PageLayout noGutter>
            {header}
            {isColumnsContent ? (
                <Columns
                    divider
                    className={styles.columns}
                    columnClassName={styles.column}
                    columnScroll
                >
                    {content}
                </Columns>
            ) : (
                { content }
            )}
        </PageLayout>
    );
}

MasterDetailPageLayout.Header = Header;
MasterDetailPageLayout.Master = Column;
MasterDetailPageLayout.Detail = Column;
