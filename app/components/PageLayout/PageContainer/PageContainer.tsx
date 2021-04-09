import clsx from 'clsx';
import { routerActions } from 'connected-react-router';
import React, { PropsWithChildren } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import BackIcon from '@resources/svg/back-arrow.svg';
import CloseIcon from '@resources/svg/cross.svg';
import Button from '~/cross-app-components/Button';

import styles from './PageContainer.module.scss';

export interface PageContainerProps {
    className?: string;
    disableBack?: boolean;
    closeRoute?: string;
    padding?: 'vertical' | 'horizontal' | 'both';
}

/**
 * @description
 * Used in <PageLayout /> to wrap content in a container with background. Commonly used in longer application flows. Supply closeRoute to be able to navigate to the start of the flow.
 *
 * @example
 * <PageLayout>
 *   <PageLayout.Container closeRoute="/">
 *     Content...
 *   </PageLayout.Container>
 * </PageLayout>
 */
export default function PageContainer({
    children,
    disableBack = false,
    closeRoute,
    padding,
    className,
}: PropsWithChildren<PageContainerProps>): JSX.Element {
    const dispatch = useDispatch();
    return (
        <section
            className={clsx(
                styles.root,
                padding === 'horizontal' && styles.paddingHorizontal,
                padding === 'vertical' && styles.paddingVertical,
                padding === 'both' && styles.paddingBoth,
                className
            )}
        >
            {!disableBack && (
                <Button
                    className={styles.back}
                    clear
                    onClick={() => dispatch(routerActions.goBack())}
                >
                    <BackIcon />
                </Button>
            )}
            {children}
            {closeRoute && (
                <Link className={styles.close} to={closeRoute}>
                    <CloseIcon />
                </Link>
            )}
        </section>
    );
}
