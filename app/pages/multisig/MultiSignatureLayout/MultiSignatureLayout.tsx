import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import PageLayout from '~/components/PageLayout';
import { PageContainerProps } from '~/components/PageLayout/PageContainer/PageContainer';
import routes from '~/constants/routes.json';
import PrintButton from '~/components/PrintButton';

import styles from './MultiSignatureLayout.module.scss';

interface MultiSignatureLayoutProps
    extends Pick<PageContainerProps, 'closeRoute' | 'disableBack'> {
    pageTitle: string;
    stepTitle?: string;
    delegateScroll?: boolean;
    print?: JSX.Element;
}

export default function MultiSignatureLayout({
    pageTitle,
    stepTitle = 'Transaction proposal',
    closeRoute = routes.MULTISIGTRANSACTIONS,
    children,
    disableBack,
    delegateScroll = false,
    print,
}: PropsWithChildren<MultiSignatureLayoutProps>): JSX.Element {
    const titleParts = pageTitle.split('|').map((s) => s.trim());

    const title =
        titleParts.length > 1 ? (
            <>
                <span className="pageTitlePrefix">{titleParts[0]}</span>
                {titleParts[1]}
            </>
        ) : (
            titleParts[0]
        );

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>{title}</h1>
            </PageLayout.Header>
            <PageLayout.Container
                className={clsx(
                    styles.container,
                    delegateScroll && styles.delegatedScroll
                )}
                closeRoute={closeRoute}
                padding="vertical"
                disableBack={disableBack}
            >
                {print ? (
                    <PrintButton className={styles.printButton}>
                        {print}
                    </PrintButton>
                ) : null}
                <h2 className={styles.header}>{stepTitle}</h2>
                <div className={styles.content}>{children}</div>
            </PageLayout.Container>
        </PageLayout>
    );
}
