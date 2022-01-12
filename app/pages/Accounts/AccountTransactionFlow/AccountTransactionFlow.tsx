import { goBack, push } from 'connected-react-router';
import React, { ComponentType, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router';
import BackButton from '~/cross-app-components/BackButton';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';

import styles from './AccountTransactionFlow.module.scss';

export interface FlowPageProps<S> {
    onNext(values: S): void;
    initial: S | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FlowChild<S, P extends keyof S = any> {
    title?: string;
    component: ComponentType<FlowPageProps<S[P]>>;
}

type FlowChildren<S extends Record<string, unknown>> = {
    [P in keyof S]: FlowChild<S, P>;
};

interface Props<S extends Record<string, unknown>> {
    title: string;
    onDone(values: S): void;
    children: FlowChildren<S>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AccountTransactionFlow<S extends Record<string, any>>({
    title: baseTitle,
    onDone,
    children,
}: Props<S>) {
    const { pathname, state } = useLocation<S>();
    const [values, setValues] = useState<S>(state ?? {});
    const { path: matchedPath } = useRouteMatch();
    const dispatch = useDispatch();

    const pages = Object.entries(children)
        .map(([k, c]: [keyof S, FlowChild<S>], i) => ({
            substate: k,
            Page: c.component,
            title: c.title ?? baseTitle,
            route: i === 0 ? matchedPath : `${matchedPath}/${i}`,
            nextRoute:
                i === Object.values(children).length - 1
                    ? undefined
                    : `${matchedPath}/${i + 1}`,
        }))
        .reverse();

    const currentPage = pages.find((p) => pathname.startsWith(p.route));

    if (!currentPage) {
        return null;
    }

    const { nextRoute, title, route: currentRoute } = currentPage;
    const isFirstPage = currentRoute === matchedPath;

    const handleNext = (substate: keyof S) => (v: Partial<S>) => {
        const newValues = { ...values, [substate]: v };
        setValues(newValues);

        if (nextRoute) {
            dispatch(push(nextRoute));
        } else {
            onDone(newValues);
        }
    };

    return (
        <Card className={styles.root}>
            {isFirstPage || (
                <BackButton
                    className={styles.backButton}
                    onClick={() => dispatch(goBack())}
                />
            )}
            <h3 className="mT0">{title}</h3>
            <Switch>
                {pages.map(({ Page, route, substate }) => (
                    <Route path={route} key={route}>
                        <Page
                            onNext={handleNext(substate)}
                            initial={values[substate]}
                        />
                    </Route>
                ))}
            </Switch>
        </Card>
    );
}

export const AccountTransactionFlowLoading = ({
    title,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
Pick<Props<any>, 'title'>) => (
    <Card className={styles.root}>
        <h3 className="mT0">{title}</h3>
        <Loading text="Loading transaction dependencies" inline />
    </Card>
);
