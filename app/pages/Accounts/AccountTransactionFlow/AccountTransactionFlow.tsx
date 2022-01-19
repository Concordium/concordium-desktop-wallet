import { goBack, push, replace } from 'connected-react-router';
import React, { ComponentType, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router';
import BackButton from '~/cross-app-components/BackButton';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { stringify } from '~/utils/JSONHelper';
import { Account, AccountTransaction } from '~/utils/types';
import { SubmitTransactionLocationState } from '../SubmitTransaction/SubmitTransaction';
import routes from '~/constants/routes.json';

import styles from './AccountTransactionFlow.module.scss';
import { isDefined } from '~/utils/basicHelpers';

export interface AccountTransactionFlowPageProps<V, F = unknown> {
    /**
     * Function to be triggered on page submission. Will take user to next page in the flow.
     */
    onNext(values: V): void;
    /**
     * Initial values for substate.
     */
    initial: V | undefined;
    /**
     * Accumulated values of entire flow (thus far)
     */
    flowValues: Partial<F>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FlowChild<F, K extends keyof F = any> {
    /**
     * Page title. Overrides title defined on AccountTransactionFlow.
     */
    title?: string;
    /**
     * Page component responsible for letting user fill out the respective substate.
     */
    component: ComponentType<AccountTransactionFlowPageProps<F[K], F>>;
}

type FlowChildren<F extends Record<string, unknown>> = {
    [K in keyof F]: FlowChild<F, K>;
};

interface Props<
    F extends Record<string, unknown>,
    T extends AccountTransaction
> {
    /**
     * Flow title. Can be overridden for each page.
     */
    title: string;
    /**
     * Function to convert flow values into an account transaction.
     */
    convert(values: F): T;
    /**
     * Function to validate the transaction flow values as a whole.
     * Return key of the substate containing the invalid field, or undefined if valid
     */
    validate?(values: F): keyof F | undefined;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: FlowChildren<F> | ((values: F) => FlowChildren<F>);
}

export default function AccountTransactionFlow<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>,
    T extends AccountTransaction
>({
    title: baseTitle,
    convert,
    children,
    validate = () => undefined,
}: Props<F, T>) {
    const { pathname, state } = useLocation<F>();
    const [values, setValues] = useState<F>(state ?? {});
    const { path: matchedPath } = useRouteMatch();
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector) as Account;
    const flowChildren = useMemo(
        () => (typeof children === 'function' ? children(values) : children),
        [children, values]
    );

    const pages = Object.entries(flowChildren)
        .filter(([, c]) => isDefined(c))
        .map(([k, c]: [keyof F, FlowChild<F>], i) => ({
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

    const handleNext = (substate: keyof F) => (v: Partial<F>) => {
        const newValues = { ...values, [substate]: v };
        setValues(newValues);

        if (nextRoute) {
            dispatch(push(nextRoute));
            return;
        }

        const invalidPage = pages.find(
            (p) => p.substate === validate(newValues)
        );

        if (invalidPage) {
            dispatch(push(invalidPage.route));
            return;
        }

        dispatch(replace(currentRoute, newValues));

        const transaction = convert(newValues);
        const serialized = stringify(transaction);
        const locationState: SubmitTransactionLocationState = {
            account,
            confirmed: {
                pathname: routes.ACCOUNTS_FINAL_PAGE,
                state: {
                    transaction: serialized,
                },
            },
            transaction: serialized,
        };
        dispatch(
            push({ pathname: routes.SUBMITTRANSFER, state: locationState })
        );
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
                            flowValues={values}
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
Pick<Props<any, any>, 'title'>) => (
    <Card className={styles.root}>
        <h3 className="mT0">{title}</h3>
        <Loading text="Loading transaction dependencies" inline />
    </Card>
);
