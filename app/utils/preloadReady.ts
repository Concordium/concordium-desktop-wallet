/**
 * This function is intended to be used by modules using `window.database` to interact with the database API in 
 * the preload script. This solves a race condition where this object is sometimes not available when the renderer 
 * script is executed. The problem has been observed on windows specifically with electron version 12 and 
 * election-builder version 23.
 * 
 * @returns A promise which resolves when `window.database` has been populated.
 * 
 * @example
 * await waitForPreloadReady();
 * ...
 */
export default async function waitForPreloadReady(timeout = 5000, interval = 50): Promise<void> {
    if (window.database) return;

    return new Promise<void>((resolve, reject) => {
        const start = Date.now();

        const checkReady = () => {
            if (window.database) {
                return resolve();
            }

            if (Date.now() - start >= timeout) {
                return reject(new Error('window.database not ready within timeout'));
            }

            setTimeout(checkReady, interval);
        };

        checkReady();
    });
}
