import { push } from 'connected-react-router';
import React, {
    ComponentType,
    Dispatch,
    SetStateAction,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormChild<F, K extends keyof F = any> {
    /**
     * Page component responsible for letting user fill out the respective substate.
     */
    component: ComponentType<MultiStepFormPageProps<F[K], F>>;
}

type FormChildren<F extends Record<string, unknown>> = {
    [K in keyof F]: FormChild<F, K>;
};

/**
 * Helper type to generate type for children expected by MultiStepForm
 */
export type OrRenderValues<
    F extends Record<string, unknown>,
    C extends FormChildren<F>
> = C | ((values: Partial<F>) => C);

interface Props<F extends Record<string, unknown>> {
    initialValues?: F;
    valueStore?: [F, Dispatch<SetStateAction<F>>];
    /**
     * Function to validate the transaction flow values as a whole.
     * Return key of the substate containing the invalid field, or undefined if valid
     */
    validate?(values: F): keyof F | undefined;
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
    valueStore?: [F, Dispatch<SetStateAction<F>>];
}

export type MultiStepFormProps<F extends Record<string, unknown>> =
    | InternalValueStoreProps<F>
    | ExternalValueStoreProps<F>;

export default function MultiStepForm<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>
>({
    initialValues = {} as F,
    valueStore,
    children,
    validate = () => undefined,
    onDone,
    onPageActive = noOp,
}: MultiStepFormProps<F>) {
    const { pathname } = useLocation();
    const internalValueStore = useState<F>(initialValues);
    const [values, setValues] = valueStore ?? internalValueStore;
    const { path: matchedPath } = useRouteMatch();
    const dispatch = useDispatch();
    const formChildren = useMemo(
        () => (typeof children === 'function' ? children(values) : children),
        [children, values]
    );
    const keyPagePairs = Object.entries(formChildren).filter(([, c]) =>
        isDefined(c)
    );

    const pages = keyPagePairs
        .map(([k, c]: [keyof F, FormChild<F>], i) => ({
            substate: k,
            Page: c.component,
            route: i === 0 ? matchedPath : `${matchedPath}/${i}`,
            nextRoute:
                i === keyPagePairs.length - 1
                    ? undefined
                    : `${matchedPath}/${i + 1}`,
        }))
        .reverse();

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
    }, [valueStore === undefined]);

    if (!currentPage) {
        return null;
    }

    const { nextRoute } = currentPage;

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

        onDone(newValues);
    };

    return (
        <Switch>
            {pages.map(({ Page, route, substate }) => (
                <Route path={route} key={route}>
                    <Page
                        onNext={handleNext(substate)}
                        initial={values[substate]}
                        formValues={values}
                    />
                </Route>
            ))}
        </Switch>
    );
}
