export default class AbortController {
    isAborted: boolean;

    isReady: boolean;

    onabort: (() => void) | null;

    constructor() {
        this.isAborted = false;
        this.isReady = true;
        this.onabort = null;
    }

    /**
     * This function will send a signal to the controlled function.
     * the function is not actually stopped before isAborted is false again.
     */
    abort() {
        console.log('abort', !this.isReady);
        if (!this.isReady) {
            this.isAborted = true;
            this.onabort?.();
        }
    }

    /**
     * The controlled function should call this, when is starts
     */
    start() {
        this.isReady = false;
        console.log('start');
    }

    /**
     * The controlled function should call this, when it finishes.
     */
    finish() {
        this.isReady = true;
        this.isAborted = false;
        this.onabort = null;
        console.log('finish');
    }
}
