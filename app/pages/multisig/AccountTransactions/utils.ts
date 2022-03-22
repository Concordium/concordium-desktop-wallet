/**
 * Takes an object with values, and another object (of the same type) with changes. Returns a function that identifies whether a field should be shown or not.
 */

import { DeepPartial } from 'redux';

// eslint-disable-next-line import/prefer-default-export
export const shouldShowField = <T, C extends DeepPartial<T>>(
    values: Partial<T>,
    changes: C
) => (getProp: (obj: Partial<T> | C) => unknown): boolean =>
    getProp(values) === undefined || getProp(changes) !== undefined;
