#[macro_use]
extern crate failure;
#[macro_use]
extern crate serde_json;

use js_sys::Promise;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{
    spawn_local,
    JsFuture
};
use curve_arithmetic::{Curve};
use dodis_yampolskiy_prf::secret as prf;
use std::{
    cmp::max,
    os::raw::c_char,
    ffi::{CStr, CString},
    convert::TryInto,
    collections::BTreeMap,
};
use serde_json::{from_str, from_value, Value};
use crypto_common::{*};
use pairing::bls12_381::{Bls12, G1};
type ExampleCurve = G1;
use wallet::{
    create_id_request_and_private_data_ext,
    //check_account_address_ext, combine_encrypted_amounts_ext, create_credential_ext,
    //create_encrypted_transfer_ext,
    //create_pub_to_sec_transfer_ext, create_sec_to_pub_transfer_ext, create_transfer_ext,
    //decrypt_encrypted_amount_ext, generate_accounts_ext,
};
use futures::executor::block_on;

use id::{
    account_holder::generate_pio,
    types::*,
    secret_sharing::Threshold,
};
use::failure::Fallible;

#[wasm_bindgen]
pub fn create_id_request_and_private_data_js(input: &str) -> String {
    return unsafe {
        let cstr: CString = {
            match CString::new(input) {
                Ok(s) => s,
                Err(e) => {
                    return format!("Could not encode response: {}", e);
                }
            }
        };
        let mut success: u8 = 127;
        let output: *mut c_char =  create_id_request_and_private_data_ext(cstr.into_raw(),  &mut success);

        return match CStr::from_ptr(output).to_str() {
            Ok(s) => s.to_string(),
            Err(e) => {
                return format!("Could not decode input string: {}", e);
            }
        };
    }
}

#[wasm_bindgen]
pub fn call_js(print_function: js_sys::Function) {
    print_function.call1(&JsValue::null(), &JsValue::from_str("Hello World"));
}


/// Try to extract a field with a given name from the JSON value.
fn try_get<A: serde::de::DeserializeOwned>(v: &Value, fname: &str) -> Fallible<A> {
    match v.get(fname) {
        Some(v) => Ok(from_value(v.clone())?),
        None => Err(format_err!("Field {} not present, but should be.", fname)),
    }
}

#[wasm_bindgen]
pub fn create_id_request_ext(input: &str, sign_function: js_sys::Function) -> String {
    match create_id_request(input, sign_function) {
        Ok(s) => s,
        Err(e) => format!("unable to create request due to: {}", e,)
    }
}

pub fn create_id_request(input: &str, sign_function: js_sys::Function) -> Fallible<String> {
    let v: Value = from_str(input)?;

    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;
    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;
    let ars_infos: BTreeMap<ArIdentity, ArInfo<ExampleCurve>> = try_get(&v, "arsInfos")?;

    // FIXME: IP defined threshold
    let threshold = {
        let l = ars_infos.len();
        ensure!(l > 0, "ArInfos should have at least 1 anonymity revoker.");
        Threshold(max((l - 1).try_into().unwrap_or(255), 1))
    };

    let prf_key: prf::SecretKey<ExampleCurve> = try_get(&v, "prfKey")?;
    let chi = CredentialHolderInfo::<ExampleCurve> {
        id_cred: try_get(&v, "idCredSec")?,
    };

    let aci = AccCredentialInfo {
        cred_holder_info: chi,
        prf_key,
    };

    // Choice of anonymity revokers, all of them in this implementation.
    let context = IPContext::new(&ip_info, &ars_infos, &global_context);

    let initial_acc_data = InitialAccountDataUsingLedger {
        sign_function,
        public_keys: try_get(&v, "publicKeys")?,
        threshold: try_get(&v, "threshold")?,
    };

    let (pio, randomness) = {
        match generate_pio(&context, threshold, &aci, &initial_acc_data) {
            Some(x) => x,
            None => bail!("Generating the pre-identity object failed."),
        }
    };

    let id_use_data = IdObjectUseData { aci, randomness };

    let response = json!({
        "preIdentityObject": Versioned::new(VERSION_0, pio),
        "id_use_data": id_use_data,
    });
    Ok(response.to_string())
}

async fn sign_public_information_for_ip_aux<C: Curve>(sign_function: &js_sys::Function, info: & PublicInformationForIP<C>) -> Fallible<BTreeMap<KeyIndex, AccountOwnershipSignature>> {
    let mut signatures = BTreeMap::new();

    console_error_panic_hook::set_once();
    let js_value_promise = match sign_function.call1(&JsValue::null(), &JsValue::from_serde(info)?) {
        Ok(s) => s,
        Err(_) => bail!("js function to sign failed"),
    };
    let promise = Promise::from(js_value_promise);
    let js_signature = match JsFuture::from(promise).await {
        Ok(s) => s,
        Err(e) => bail!("Promise failed to resolve"),
    };

    let signature: AccountOwnershipSignature = js_signature.into_serde()?;
    signatures.insert(KeyIndex(0), signature);

    return Ok(signatures);
}

struct InitialAccountDataUsingLedger {
    pub sign_function: js_sys::Function,
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}


impl InitialAccountDataTrait for InitialAccountDataUsingLedger {
    fn get_threshold(&self) -> SignatureThreshold {
        return self.threshold;
    }

    fn get_public_keys(&self) -> Vec<VerifyKey> {
        return (&self.public_keys).to_vec();
    }

    fn sign_public_information_for_ip<C: Curve>(&self, info: & PublicInformationForIP<C>) -> BTreeMap<KeyIndex, AccountOwnershipSignature> {
        match block_on(sign_public_information_for_ip_aux(&self.sign_function, info)) {
            Ok(map) => map,
            Err(_) => BTreeMap::new(),
        }
    }
}
