/* eslint-disable */
import { WindowFunctions } from './preload/preloadTypes';

declare global {
    interface Window extends WindowFunctions {}
}
