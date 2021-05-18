type Updater = (update: (x: number) => number) => void;

export default class AbortController {
    isAborted: boolean;

    isReady: boolean;

    updateCounter: Updater;

    constructor(updateCounter: Updater) {
        this.isAborted = false;
        this.isReady = true;
        this.updateCounter = updateCounter;
    }

    abort() {
        this.isAborted = true;
    }

    start() {
        this.isReady = false;
        this.isAborted = false;
    }

    finish() {
        this.isReady = true;
        this.updateCounter((x) => x + 1);
    }
}
