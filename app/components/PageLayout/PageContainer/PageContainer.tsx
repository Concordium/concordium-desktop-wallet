/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from 'clsx';
import { routerActions } from 'connected-react-router';
import React, { PropsWithChildren } from 'react';
import { useDispatch } from 'react-redux';
import { LocationDescriptorObject } from 'history';
import CloseButton from '~/cross-app-components/CloseButton';
import BackButton from '~/cross-app-components/BackButton';
import styles from './PageContainer.module.scss';

export interface PageContainerProps {
    className?: string;
    disableBack?: boolean;
    closeRoute?: string | LocationDescriptorObject;
    backRoute?: string | LocationDescriptorObject;
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
    backRoute,
    padding,
    className,
}: PropsWithChildren<PageContainerProps>): JSX.Element {
    const dispatch = useDispatch();
    const backAction = () => {
        if (backRoute) {
            return routerActions.push(backRoute as any);
        }
        return routerActions.goBack();
    };

    return (
        <div
            className={clsx(
                styles.root,
                padding === 'horizontal' && styles.paddingHorizontal,
                padding === 'vertical' && styles.paddingVertical,
                padding === 'both' && styles.paddingBoth,
                className
            )}
        >
            {children}
            {!disableBack && (
                <BackButton
                    className={styles.back}
                    onClick={() => dispatch(backAction())}
                />
            )}
            {closeRoute && (
                <CloseButton
                    className={styles.close}
                    onClick={() =>
                        dispatch(routerActions.push(closeRoute as any))
                    }
                />
            )}
        </div>
    );
}
