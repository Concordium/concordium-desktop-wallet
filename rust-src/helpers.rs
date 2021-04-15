use std::collections::BTreeMap;
use id::types::*;
use crypto_common::{types::KeyIndex};
use std::convert::TryInto;
use keygen_bls::keygen_bls;
use serde_json::{from_value, Value as SerdeValue};
use ::failure::Fallible;
use pairing::bls12_381::Fr;

pub fn build_key_map(keys: &Vec<VerifyKey>) -> BTreeMap<KeyIndex, VerifyKey> {
    keys.iter().enumerate().map(|(index, key)| (KeyIndex(index.try_into().unwrap()), key.clone())).collect()
}

/// Try to extract a field with a given name from the JSON value.
pub fn try_get<A: serde::de::DeserializeOwned>(v: &SerdeValue, fname: &str) -> Fallible<A> {
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
