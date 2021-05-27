export default class AbortController {
    isAborted: boolean;

    isReady: boolean;

    constructor() {
        this.isAborted = false;
        this.isReady = true;
    }

    /**
     * This function will send a signal to the controlled function.
     * the function is not actually stopped before isAborted is false again.
     */
    abort() {
        this.isAborted = true;
    }

    /**
     * The controlled function should call this, when is starts
     */
    start() {
        this.isReady = false;
    }

    /**
     * The controlled function should call this, when is finishes normally
     */
    finish() {
        this.isReady = true;
    }

    /**
     * The controlled function should call this, when is acknowledges that it has been aborted
     */
    onAborted() {
        this.isReady = true;
        this.isAborted = false;
    }
}
