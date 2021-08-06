import { WindowFunctions } from './preload/preloadTypes';

declare global {
    type Window = WindowFunctions;
}
