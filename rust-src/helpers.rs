use std::collections::BTreeMap;
use id::types::*;
use crypto_common::types::KeyIndex;
use std::convert::TryInto;
use keygen_bls::keygen_bls;
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

use ff::Field;
use hkdf::Hkdf; // TODO Remove dependency when removing this
use pairing::bls12_381::G1;
use sha2::{Digest, Sha256};

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

// TODO: Remove this when fix is merged
fn keygen_bls_fixed(ikm: &[u8], key_info: &[u8]) -> Result<Fr, hkdf::InvalidLength> {
    let mut ikm = ikm.to_vec();
    ikm.push(0);
    let l = 48; // = 48 for G1; r is
                // 52435875175126190479447740508185965837690552500527637822603658699938581184513
    let mut l_bytes = key_info.to_vec();
    l_bytes.push(0);
    l_bytes.push(l);
    let salt = b"BLS-SIG-KEYGEN-SALT-";
    let mut sk = Fr::zero();
    // shift with
    // 452312848583266388373324160190187140051835877600158453279131187530910662656 =
    // 2^248 = 2^(31*8)
    let shift = Fr::from_repr(FrRepr([0, 0, 0, 72057594037927936])).unwrap();
    let mut salt = Sha256::digest(&salt[..]);
    while sk.is_zero() {
        let (_, h) = Hkdf::<Sha256>::extract(Some(&salt), &ikm);
        let mut okm = vec![0u8; l as usize];
        h.expand(&l_bytes, &mut okm)?;
        // Reverse the vector since `scalar_from_bytes` expects the bytes in
        // little-endian
        okm.reverse();
        // Following the standard, we have to
        // interpret the 48 bytes in `okm` as an integer and then reduce modulo r.
        // Since 2^(31*8) < r < 2^(32*8), we use `scalar_from_bytes` twice by
        // calculating (in Fr) y1 + shift*y2, where
        // y1 = scalar_from_bytes(first 31 bytes of okm), and
        // y2 = scalar_from_bytes(last 17 bytes of okm)
        let mut y1_vec = [0; 32];
        let mut y2_vec = [0; 32];
        let slice_y1 = &mut y1_vec[0..31];
        slice_y1.clone_from_slice(&okm[0..31]);
        let slice_y2 = &mut y2_vec[0..okm.len() - slice_y1.len()];
        slice_y2.clone_from_slice(&okm[31..]);
        let y1 = G1::scalar_from_bytes(&y1_vec);
        let mut y2 = G1::scalar_from_bytes(&y2_vec);
        y2.mul_assign(&shift);
        sk = y1;
        sk.add_assign(&y2);
        salt = Sha256::digest(&salt);
    }
    Ok(sk)
}

// TODO: Change this to use keygen_bls from concordium_base (when fix is merged)
pub fn generate_bls_key(seed: &str) -> Result<Fr> {
    let key_info = b"";

    match keygen_bls_fixed(&hex::decode(seed)?, key_info) {
        Ok(s) => Ok(s),
        Err(_) => Err(anyhow!("unable to build parse seed for bls_keygen.")),
    }
}

// TODO: Change this to use deprecated version
pub fn generate_bls_key_deprecated(seed: &str) -> Result<Fr> {
    let key_info = b"";

    match keygen_bls(seed.as_bytes(), key_info) {
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
