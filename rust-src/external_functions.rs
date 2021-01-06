use wasm_bindgen::prelude::*;
use crate::{
    aux_functions::*,
};

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

#[wasm_bindgen]
pub fn generate_unsigned_credential_ext(
    input: &str
) -> String {
    match generate_unsigned_credential_aux(input) {
        Ok(s) => s,
        Err(e) => format!("unable to generate unsigned credential due to: {}", e),
    }
}

#[wasm_bindgen]
pub fn get_credential_deployment_info_ext(
    signature: &str,
    unsigned_info: &str
) -> String {
    match get_credential_deployment_info_aux(signature, unsigned_info) {
        Ok(s) => s,
        Err(e) => format!("unable to get credential due to: {}", e),
    }
}

#[wasm_bindgen]
pub fn decrypt_amounts_ext(
    input: &str
) -> String {
    match decrypt_amounts_aux(input) {
        Ok(s) => s,
        Err(e) => format!("unable to decrypt transactions due to: {}", e),
    }
}


