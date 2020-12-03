#[macro_use]
extern crate failure;
#[macro_use]
extern crate serde_json;

use ledger::{ApduCommand, LedgerApp, Error};
use wasm_bindgen::prelude::*;
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
use ed25519_dalek as ed25519;
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

/// Try to extract a field with a given name from the JSON value.
fn try_get<A: serde::de::DeserializeOwned>(v: &Value, fname: &str) -> Fallible<A> {
    match v.get(fname) {
        Some(v) => Ok(from_value(v.clone())?),
        None => Err(format_err!("Field {} not present, but should be.", fname)),
    }
}

#[wasm_bindgen]
pub fn create_id_request_ext(input: &str ) -> String {
    match create_id_request(input) {
        Ok(s) => s,
        Err(e) => format!("unable to create request due to: {}", e,)
    }
}

pub fn create_id_request(input: &str ) -> Fallible<String> {
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

    let prf_key: prf::SecretKey<ExampleCurve> = try_get(&v, "prf_key")?;
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
        ledger: LedgerApp::new()?,
        public_keys: try_get(&v, "public_keys")?,
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

fn fake_sign() -> ed25519::Signature {
    return ed25519::Signature::new([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, ]);
}
struct InitialAccountDataUsingLedger {
    ledger: LedgerApp,
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
        let mut signatures = BTreeMap::new();

        let signature = AccountOwnershipSignature::from(fake_sign()); // ledger.sign_public_information_for_ip(info).into();
        signatures.insert(KeyIndex(0), signature);

        return signatures;
    }
}


//#[wasm_bindgen]
//pub fn generate_pio_js(input: &str) -> String {
//
//}
