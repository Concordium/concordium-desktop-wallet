/* eslint-disable import/prefer-default-export */
export const logInputOutput = <TArgs extends unknown[], TReturn>(
    fun: (...args: TArgs) => TReturn
): typeof fun => (...args) => {
    // eslint-disable-next-line no-console
    console.log('input', ...args);
    const value = fun(...args);
    // eslint-disable-next-line no-console
    console.log('output', value);
    return value;
};
