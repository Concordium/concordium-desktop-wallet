import { isDefined } from './basicHelpers';

/**
 * Takes a callback function taking 1 argument, returning a new function taking same argument, applying callback only if supplied argument is defined.
 */
export const orUndefined = <A, R>(fun: (v: A) => R) => (
    v: A | undefined
): R | undefined => (isDefined(v) ? fun(v) : undefined);

/**
 * Takes a function producing a boolean result and flips it, returning a function producing the opposite.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const not = <A extends any[]>(
    f: (...a: A) => boolean
): ((...a: A) => boolean) => (...args) => !f(...args);
