import * as wasm from "./desktop_wallet_bg.wasm";
export * from "./desktop_wallet_bg.js";
import { __wbg_set_wasm } from "./desktop_wallet_bg.js";
__wbg_set_wasm(wasm);