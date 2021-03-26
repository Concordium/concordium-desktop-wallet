import React, { PropsWithChildren } from 'react';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';

import styles from './MultiSignatureLayout.module.scss';

interface MultiSignatureLayoutProps {
    pageTitle: string;
    stepTitle: string;
    closeRoute?: string;
}

export default function MultiSignatureLayout({
    pageTitle,
    stepTitle,
    closeRoute = routes.MULTISIGTRANSACTIONS,
    children,
}: PropsWithChildren<MultiSignatureLayoutProps>): JSX.Element {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>{pageTitle}</h1>
            </PageLayout.Header>
            <PageLayout.Container
                className={styles.container}
                closeRoute={closeRoute}
                padding="vertical"
            >
                <h2 className={styles.header}>{stepTitle}</h2>
                <div className={styles.content}>{children}</div>
            </PageLayout.Container>
        </PageLayout>
    );
}
