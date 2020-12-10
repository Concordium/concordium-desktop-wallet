#[macro_use]
extern crate failure;
#[macro_use]
extern crate serde_json;
extern crate console_error_panic_hook;
extern crate hex;

use crypto_common::*;
use curve_arithmetic::Curve;
use dodis_yampolskiy_prf::secret as prf;
use hex::FromHex;
use pairing::bls12_381::{Bls12, Fr, G1};
use serde_json::{from_str, from_value, Value as SerdeValue};
use std::{cmp::max, collections::BTreeMap, convert::TryInto};
use wasm_bindgen::prelude::*;
type ExampleCurve = G1;
use ed25519_dalek as ed25519;

use ::failure::Fallible;
use id::{
    account_holder::{build_pub_info_for_ip, generate_pio},
    secret_sharing::Threshold,
    types::*,
};
use keygen_bls::keygen_bls;
use pedersen_scheme::value::Value;

/// Try to extract a field with a given name from the JSON value.
fn try_get<A: serde::de::DeserializeOwned>(v: &SerdeValue, fname: &str) -> Fallible<A> {
    match v.get(fname) {
        Some(v) => Ok(from_value(v.clone())?),
        None => Err(format_err!("Field {} not present, but should be.", fname)),
    }
}

pub fn generate_bls(seed: &str) -> Fallible<Fr> {
    let key_info = b"";

    match keygen_bls(seed.as_bytes(), key_info) {
        Ok(s) => Ok(s),
        Err(_) => Err(format_err!("unable to build parse id_cred_sec.")),
    }
}

#[wasm_bindgen]
pub fn build_pub_info_for_ip_ext(
    input: &str,
    id_cred_sec_string: &str,
    prf_key_string: &str,
) -> String {
    match build_pub_info_for_ip_aux(input, prf_key_string, id_cred_sec_string) {
        Ok(s) => s,
        Err(e) => format!("unable to build PublicInformationForIP due to: {}", e,),
    }
}

fn build_pub_info_for_ip_aux(
    input: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;
    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;
    let ars_infos: BTreeMap<ArIdentity, ArInfo<ExampleCurve>> = try_get(&v, "arsInfos")?;
    let context = IPContext::new(&ip_info, &ars_infos, &global_context);

    let id_cred_sec = Value::new(generate_bls(id_cred_sec_seed)?);
    let prf_key = prf::SecretKey::new(generate_bls(prf_key_seed)?);

    let initial_acc_data = InitialAccountDataStruct {
        public_keys: try_get(&v, "publicKeys")?,
        threshold: try_get(&v, "threshold")?,
    };

    let pub_info_for_ip =
        match build_pub_info_for_ip(&context, &id_cred_sec, &prf_key, &initial_acc_data) {
            Some(x) => x,
            None => return Err(format_err!("failed building pub_info_for_ip.")),
        };

    let response = json!(pub_info_for_ip);
    Ok(response.to_string())
}

#[wasm_bindgen]
pub fn create_id_request_ext(
    input: &str,
    signature: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> String {
    match create_id_request_aux(input, signature, id_cred_sec_seed, prf_key_seed) {
        Ok(s) => s,
        Err(e) => format!("unable to create request due to: {}", e,),
    }
}

fn create_id_request_aux(
    input: &str,
    signature: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;
    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;
    let ars_infos: BTreeMap<ArIdentity, ArInfo<ExampleCurve>> = try_get(&v, "arsInfos")?;
    let context = IPContext::new(&ip_info, &ars_infos, &global_context);

    // FIXME: IP defined threshold
    let threshold = {
        let l = ars_infos.len();
        ensure!(l > 0, "ArInfos should have at least 1 anonymity revoker.");
        Threshold(max((l - 1).try_into().unwrap_or(255), 1))
    };

    let id_cred_sec = Value::new(generate_bls(id_cred_sec_seed)?);
    let prf_key = prf::SecretKey::new(generate_bls(prf_key_seed)?);

    let chi = CredentialHolderInfo::<ExampleCurve> {
        id_cred: IdCredentials { id_cred_sec },
    };

    let aci = AccCredentialInfo {
        cred_holder_info: chi,
        prf_key,
    };

    let signature_bytes = <[u8; 64]>::from_hex(signature).expect("Decoding failed");

    let initial_acc_data = InitialAccountDataWithSignature {
        signature: ed25519::Signature::new(signature_bytes).into(),
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
        "idObjectRequest": Versioned::new(VERSION_0, pio),
        "id_use_data": id_use_data,
    });
    Ok(response.to_string())
}

struct InitialAccountDataStruct {
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl InitialAccountDataTrait for InitialAccountDataStruct {
    fn get_threshold(&self) -> SignatureThreshold {
        self.threshold
    }

    fn get_public_keys(&self) -> Vec<VerifyKey> {
        (&self.public_keys).to_vec()
    }
}

struct InitialAccountDataWithSignature {
    pub signature: AccountOwnershipSignature,
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl InitialAccountDataTrait for InitialAccountDataWithSignature {
    fn get_threshold(&self) -> SignatureThreshold {
        self.threshold
    }

    fn get_public_keys(&self) -> Vec<VerifyKey> {
        (&self.public_keys).to_vec()
    }
}

impl InitialAccountDataWithSigning for InitialAccountDataWithSignature {
    fn sign_public_information_for_ip<C: Curve>(
        &self,
        _: &PublicInformationForIP<C>,
    ) -> BTreeMap<KeyIndex, AccountOwnershipSignature> {
        let mut signatures = BTreeMap::new();
        signatures.insert(KeyIndex(0), self.signature);
        signatures
    }
}
