use std::collections::BTreeMap;
use id::types::*;
use crypto_common::{types::KeyIndex};
use std::convert::TryInto;

pub fn build_key_map(keys: &Vec<VerifyKey>) -> BTreeMap<KeyIndex, VerifyKey> {
    keys.iter().enumerate().map(|(index, key)| (KeyIndex(index.try_into().unwrap()), key.clone())).collect()
}
