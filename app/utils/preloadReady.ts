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
