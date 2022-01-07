import { push } from 'connected-react-router';
import React, {
    Children,
    ComponentType,
    // createContext,
    ReactElement,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router';
import Card from '~/cross-app-components/Card';
import {
    MakeRequired,
    PolymorphicComponentProps,
    PropsOf,
} from '~/utils/types';

import styles from './AccountTransactionFlow.module.scss';

interface BasePageProps {
    title?: string;
}

type OnNextFunction<S> = (values: S) => void;

interface RequiredChildProps<S> {
    onNext: OnNextFunction<S>;
    initial: S | undefined;
}

// type OtherPageAsProps<
//     S,
//     C extends ComponentType<RequiredChildProps<S>>
// > = MakeRequired<PolymorphicComponentProps<C, BasePageProps>, 'as'>;

type PageAsProps<S, C extends ComponentType<RequiredChildProps<S>>> = Omit<
    MakeRequired<PolymorphicComponentProps<C, BasePageProps>, 'as'>,
    keyof RequiredChildProps<S>
>;

// interface PageRenderChildProps<S> extends BasePageProps {
//     children: OnNextFunction<S>;
// }

export function FlowPage<S, C extends ComponentType<RequiredChildProps<S>>>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: PageAsProps<S, C>
) {
    return null;
}

interface Props<S> {
    title: string;
    serializeTransaction(values: S): string;
    children:
        | ReactElement<PropsOf<typeof FlowPage>>
        | ReactElement<PropsOf<typeof FlowPage>>[];
    // children:
    //     | ReactElement<PageAsProps<S, ComponentType<RequiredChildProps<S>>>>
    //     | ReactElement<PageAsProps<S, ComponentType<RequiredChildProps<S>>>>[];
}

export default function AccountTransactionFlow<S>({
    title: baseTitle,
    serializeTransaction,
    children,
}: Props<S>) {
    const { pathname, state } = useLocation<S>();
    const [values, setValues] = useState<S>(state);
    const { path: matchedPath } = useRouteMatch();
    const dispatch = useDispatch();

    const pages = Children.map(children, (c, i) => {
        const { title, as, ...asProps } = c.props;
        return {
            title,
            Page: as,
            props: asProps,
            route: i === 0 ? matchedPath : `${matchedPath}/${i}`,
            nextRoute:
                i === Children.count(children) - 1
                    ? undefined
                    : `${matchedPath}/${i + 1}`,
        };
    }).reverse();

    const currentPage = pages.find((p) => pathname.startsWith(p.route));

    if (!currentPage) {
        return null;
    }

    const { title = baseTitle, nextRoute } = currentPage;

    function next() {
        if (nextRoute) {
            dispatch(push(nextRoute));
        } else if (values !== undefined) {
            const serialized = serializeTransaction(values);
            // eslint-disable-next-line no-console
            console.log(serialized);
            // go to submit page...
        }
    }

    function handleNext(v: Partial<S>): void {
        setValues((e) => ({ ...e, ...v }));
        next();
    }

    return (
        <Card className={styles.root}>
            <h3>{title}</h3>
            <div>{JSON.stringify(currentPage)}</div>
            <Switch>
                {pages.map(({ Page, route, props }) => (
                    <Route path={route} key={route}>
                        <Page {...props} onNext={handleNext} initial={values} />
                    </Route>
                ))}
            </Switch>
        </Card>
    );
}

AccountTransactionFlow.Page = FlowPage;
