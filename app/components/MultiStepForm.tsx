import { push, replace } from 'connected-react-router';
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useLocation, useRouteMatch } from 'react-router';
import { isDefined, noOp } from '~/utils/basicHelpers';
import { useUpdateEffect } from '~/utils/hooks';

export interface MultiStepFormPageProps<V, F = unknown> {
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
    formValues: Partial<F>;
}

const makeFormPageObjects = <F extends Record<string, unknown>>(
    baseRoute: string,
    children: FormChildren<F>
) => {
    const keyPagePairs = Object.entries(children).filter(([, c]) =>
        isDefined(c)
    );

    return keyPagePairs.map(([k, c]: [keyof F, FormChild<F>], i) => ({
        substate: k,
        render: c.render,
        route: i === 0 ? baseRoute : `${baseRoute}/${i}`,
    }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormChild<F, K extends keyof F = any> {
    /**
     * Function to render page component responsible for letting user fill out the respective substate.
     * This is a function to avoid anonymous components messing up render tree updates.
     */
    render(
        initial: F[K] | undefined,
        onNext: (values: F[K]) => void,
        formValues: Partial<F>
    ): JSX.Element;
}

export type FormChildren<F extends Record<string, unknown>> = {
    [K in keyof F]?: FormChild<F, K>;
};

/**
 * Helper type to generate type for children expected by MultiStepForm
 */
export type OrRenderValues<
    F extends Record<string, unknown>,
    C extends FormChildren<F>
> = C | ((values: Partial<F>) => C);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidateValues<F extends Record<string, any>> = (
    values: F
) => keyof F | undefined;

interface Props<F extends Record<string, unknown>> {
    /**
     * Base route where multistep form is included. Defaults to path from useRouteMatch hook.
     */
    baseRoute?: string;
    /**
     * Function to validate the transaction flow values as a whole.
     * Return key of the substate containing the invalid field, or undefined if valid
     */
    validate?: ValidateValues<F>;
    onDone(values: F): void;
    onPageActive?(step: keyof F, values: Partial<F>): void;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<F, FormChildren<F>>;
}

interface InternalValueStoreProps<F extends Record<string, unknown>>
    extends Props<F> {
    initialValues?: F;
}

interface ExternalValueStoreProps<F extends Record<string, unknown>>
    extends Props<F> {
    valueStore: [Partial<F>, Dispatch<SetStateAction<Partial<F>>>];
}

export type MultiStepFormProps<F extends Record<string, unknown>> =
    | InternalValueStoreProps<F>
    | ExternalValueStoreProps<F>;

export default function MultiStepForm<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>
>(props: MultiStepFormProps<F>) {
    const { path: matchedPath } = useRouteMatch();
    const {
        children,
        validate = () => undefined,
        onDone,
        onPageActive = noOp,
        baseRoute = matchedPath,
    } = props;
    const initialValues =
        (props as InternalValueStoreProps<F>).initialValues ?? ({} as F);
    const { pathname } = useLocation();
    const internalValueStore = useState<Partial<F>>(initialValues);
    const externalValueStore = (props as ExternalValueStoreProps<F>).valueStore;
    const [values, setValues] = externalValueStore ?? internalValueStore;
    const dispatch = useDispatch();

    const getChildren = useCallback(
        (v: Partial<F>) =>
            typeof children === 'function' ? children(v) : children,
        [children]
    );

    const pages = useMemo(
        () => makeFormPageObjects(baseRoute, getChildren(values)).reverse(),
        [getChildren, values, baseRoute]
    );

    const currentPage = pages.find((p) => pathname.startsWith(p.route));

    useEffect(() => {
        if (currentPage?.substate) {
            onPageActive(currentPage?.substate, values);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage?.substate]);

    useUpdateEffect(() => {
        throw new Error(
            'Changing value store during the lifetime of MultiStepForm will result in errors.'
        );
    }, [externalValueStore === undefined]);

    const handleNext = (substate: keyof F) => (v: Partial<F>) => {
        const newValues = { ...values, [substate]: v };
        setValues(newValues);
        const newPages = makeFormPageObjects(baseRoute, getChildren(newValues));
        const currentIndex = newPages.findIndex((p) => p.substate === substate);

        if (currentIndex === -1) {
            dispatch(replace(baseRoute));
        } else if (currentIndex !== newPages.length - 1) {
            const { route } = newPages[currentIndex + 1] ?? {};

            dispatch(push(route));
        } else {
            const invalidPage = pages.find(
                (p) => p.substate === validate(newValues as F)
            );

            if (invalidPage) {
                dispatch(push(invalidPage.route));
                return;
            }

            onDone(newValues as F);
        }
    };

    return (
        <Switch>
            {pages.map(({ render, route, substate }) => (
                <Route path={route} key={route}>
                    {render(values[substate], handleNext(substate), values)}
                </Route>
            ))}
        </Switch>
    );
}
