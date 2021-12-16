use std::collections::BTreeMap;
use id::types::*;
use crypto_common::types::KeyIndex;
use std::convert::TryInto;
use keygen_bls::{keygen_bls, keygen_bls_deprecated};
use serde_json::{from_value, Value as SerdeValue};
use anyhow::{Result, anyhow, bail};
use pairing::bls12_381::{Fr, FrRepr};
use dodis_yampolskiy_prf::SecretKey;
use curve_arithmetic::Curve;
use pedersen_scheme::{
    Randomness as PedersenRandomness, Value,
};
use ff::{PrimeField};
use hex;

pub fn build_key_map(keys: &Vec<VerifyKey>) -> BTreeMap<KeyIndex, VerifyKey> {
    keys.iter().enumerate().map(|(index, key)| (KeyIndex(index.try_into().unwrap()), key.clone())).collect()
}

/// Try to extract a field with a given name from the JSON value.
pub fn try_get<A: serde::de::DeserializeOwned>(v: &SerdeValue, fname: &str) -> Result<A> {
    match v.get(fname) {
        Some(v) => Ok(from_value(v.clone())?),
        None => Err(anyhow!("Field {} not present, but should be.", fname)),
    }
}

pub fn generate_bls_key(seed: &str) -> Result<Fr> {
    let key_info = b"";

    match keygen_bls(&hex::decode(seed)?, key_info) {
        Ok(s) => Ok(s),
        Err(_) => Err(anyhow!("unable to build parse seed for bls_keygen.")),
    }
}

pub fn generate_bls_key_deprecated(seed: &str) -> Result<Fr> {
    let key_info = b"";

    match keygen_bls_deprecated(seed.as_bytes(), key_info) {
        Ok(s) => Ok(s),
        Err(_) => Err(anyhow!("unable to build parse seed for bls_keygen. (deprecated)")),
    }
}

#[derive(Copy, Clone)]
pub enum RawBlsType {
    Seed,
    SeedDeprecated,
    Bls
}

pub fn get_bls(s: &str, raw_type: RawBlsType) -> Result<Fr> {
    match raw_type {
        RawBlsType::SeedDeprecated => Ok(generate_bls_key_deprecated(&s)?),
        RawBlsType::Seed => Ok(generate_bls_key(&s)?),
        RawBlsType::Bls => {
            let fr_numbers = [u64::from_str_radix(&s[48..64], 16)?, u64::from_str_radix(&s[32..48], 16)?, u64::from_str_radix(&s[16..32], 16)?, u64::from_str_radix(&s[0..16], 16)?];
            Ok(Fr::from_repr(FrRepr(fr_numbers)).unwrap())
        },
    }
}

pub fn get_prf_key<C: Curve<Scalar = Fr>>(raw: &str, raw_type: RawBlsType) -> Result<SecretKey<C>> {
    Ok(SecretKey::new(get_bls(raw, raw_type)?))
}

pub fn get_id_cred_sec<C: Curve<Scalar = Fr>>(raw: &str, raw_type: RawBlsType) -> Result<Value<C>> {
    Ok(Value::new(get_bls(raw, raw_type)?))
}

pub fn generate_cred_id<C: Curve>(prf_key: &SecretKey<C>, cred_counter: u8, global_context: &GlobalContext<C>) -> Result<C> {
    let cred_id_exponent = match prf_key.prf_exponent(cred_counter) {
        Ok(exp) => exp,
        Err(_) => bail!(
            "Cannot create CDI with this account number because K + {} = 0.",
            cred_counter
        ),
    };

    Ok(global_context
       .on_chain_commitment_key
       .hide(
           &Value::<C>::new(cred_id_exponent),
           &PedersenRandomness::zero(),
       )
       .0)
}
