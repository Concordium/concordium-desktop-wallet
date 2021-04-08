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
     * MasterDetailPageLayout.Header, MasterDetailPageLayout.Master, MasterDetailPageLayout.Detail
     */
    children: [ReactElement, ReactElement, ReactElement];
}

export default function MasterDetailPageLayout({
    children,
}: MasterDetailPageLayoutProps): JSX.Element {
    const { columns, header } = useMemo(() => {
        const reactChildren = Children.toArray(children) as ReactElement[];

        return {
            columns: reactChildren.filter((c) => !isPageHeader(c)),
            header: reactChildren.find((c) => isPageHeader(c)),
        };
    }, [children]);

    return (
        <PageLayout noGutter>
            {header}
            <Columns
                divider
                className={styles.columns}
                columnClassName={styles.column}
                columnScroll
            >
                {columns}
            </Columns>
        </PageLayout>
    );
}

MasterDetailPageLayout.Header = Header;
MasterDetailPageLayout.Master = Column;
MasterDetailPageLayout.Detail = Column;
