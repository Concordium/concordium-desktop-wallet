/* eslint-disable */
import { WindowFunctions } from './preload/preloadTypes';

declare global {
    interface Window extends WindowFunctions {}
    namespace NodeJS {
        interface ProcessEnv {
            TARGET_NET: 'stagenet' | 'testnet' | 'protonet' | 'mainnet';
        }
    }
}
