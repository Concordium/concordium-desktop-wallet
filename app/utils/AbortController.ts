export default class AbortController {
    isAborted: boolean;

    constructor() {
        this.isAborted = false;
    }

    abort() {
        this.isAborted = true;
    }
}
