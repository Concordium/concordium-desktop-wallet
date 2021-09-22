import AbortController from './AbortController';

/**
 * Extension of AbortController with a hasLooped property, which can be used to check if the controlled function has performed a loop.
 */
export default class AbortControllerWithLooping extends AbortController {
    hasLooped: boolean;

    constructor() {
        super();
        this.hasLooped = false;
    }

    start() {
        super.start();
        this.hasLooped = false;
    }

    finish() {
        super.finish();
        this.hasLooped = false;
    }

    /**
     * The controlled function should call this, when is performs a loop.
     */
    onLoop() {
        this.hasLooped = true;
    }
}
