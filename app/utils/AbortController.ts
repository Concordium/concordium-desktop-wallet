export default class AbortController {
    isAborted: boolean;

    isReady: boolean;

    hasLooped: boolean;

    constructor() {
        this.isAborted = false;
        this.isReady = true;
        this.hasLooped = false;
    }

    /**
     * This function will send a signal to the controlled function.
     * the function is not actually stopped before isAborted is false again.
     */
    abort() {
        if (!this.isReady) {
            this.isAborted = true;
        }
    }

    /**
     * The controlled function should call this, when is starts
     */
    start() {
        this.isReady = false;
        this.hasLooped = false;
    }

    /**
     * The controlled function should call this, when it finishes.
     */
    finish() {
        this.isReady = true;
        this.isAborted = false;
        this.hasLooped = false;
    }

    onLoop() {
        this.hasLooped = true;
    }
}
