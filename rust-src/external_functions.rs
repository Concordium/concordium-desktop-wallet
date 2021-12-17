use wasm_bindgen::prelude::*;
use crate::{
    helpers::{get_prf_key, get_id_cred_sec, RawBlsType},
    aux_functions::*,
    genesis_account::*,
};

#[wasm_bindgen(js_name = buildPublicInformationForIp)]
pub fn build_pub_info_for_ip_ext(
    input: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> String {
    let raw_type = RawBlsType::Seed;
    let prf_key = get_prf_key(prf_key_seed, raw_type).expect("Unable to compute  prf key");
    let id_cred_sec = get_id_cred_sec(id_cred_sec_seed, raw_type).expect("Unable to compute id cred sec");
    match build_pub_info_for_ip_aux(input, id_cred_sec, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to build PublicInformationForIP due to: {}", e,),
    }
}

#[wasm_bindgen(js_name = createIdRequest)]
pub fn create_id_request_ext(
    input: &str,
    signature: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> String {
    let raw_type = RawBlsType::Seed;
    let prf_key = get_prf_key(prf_key_seed, raw_type).expect("Unable to compute prf key");
    let id_cred_sec = get_id_cred_sec(id_cred_sec_seed, raw_type).expect("Unable to compute id cred sec");
    match create_id_request_aux(input, signature, id_cred_sec, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to create request due to: {}", e,),
    }
}

#[wasm_bindgen(js_name = generateUnsignedCredential)]
pub fn generate_unsigned_credential_ext(
    input: &str,
    id_cred_sec_raw: &str,
    prf_key_raw: &str,
    use_deprecated: bool,
) -> String {
    let raw_type = if use_deprecated { RawBlsType::SeedDeprecated } else { RawBlsType::Bls };
    let prf_key = get_prf_key(prf_key_raw, raw_type).expect("Unable to compute prf key");
    let id_cred_sec = get_id_cred_sec(id_cred_sec_raw, raw_type).expect("Unable to compute id cred sec");
    match generate_unsigned_credential_aux(input, id_cred_sec, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to generate unsigned credential due to: {}", e),
    }
}

#[wasm_bindgen(js_name = getDeploymentInfo)]
pub fn get_credential_deployment_info_ext(
    signature: &str,
    unsigned_info: &str,
) -> String {
    match get_credential_deployment_info_aux(signature, unsigned_info) {
        Ok(s) => s,
        Err(e) => format!("unable to get credential due to: {}", e),
    }
}

#[wasm_bindgen(js_name = getDeploymentDetails)]
pub fn get_credential_deployment_details_ext(
    signature: &str,
    unsigned_info: &str,
    expiry: u64
) -> String {
    match get_credential_deployment_details_aux(signature, unsigned_info, expiry) {
        Ok(s) => s,
        Err(e) => format!("unable to get credential due to: {}", e),
    }
}

#[wasm_bindgen]
pub fn decrypt_amounts_ext(
    input: &str,
    prf_key_raw: &str,
    use_deprecated: bool,
) -> String {
    let raw_type = if use_deprecated { RawBlsType::SeedDeprecated } else { RawBlsType::Bls };
    let prf_key = get_prf_key(prf_key_raw, raw_type).expect("Unable to compute prf key");
    match decrypt_amounts_aux(input, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to decrypt transactions due to: {}", e),
    }
}

#[wasm_bindgen(js_name = createTransferToPublicData)]
pub fn create_sec_to_pub_ext(
    input: &str,
    prf_key_raw: &str,
    use_deprecated: bool,
) -> String {
    let raw_type = if use_deprecated { RawBlsType::SeedDeprecated } else { RawBlsType::Bls };
    let prf_key = get_prf_key(prf_key_raw, raw_type).expect("Unable to compute prf key");
    match create_sec_to_pub_aux(input, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to create transfer to public due to: {}", e),
    }
}

#[wasm_bindgen(js_name = createTransferToEncryptedData)]
pub fn create_pub_to_sec_ext(
    input: &str,
    prf_key_raw: &str,
    use_deprecated: bool,
) -> String {
    let raw_type = if use_deprecated { RawBlsType::SeedDeprecated } else { RawBlsType::Bls };
    let prf_key = get_prf_key(prf_key_raw, raw_type).expect("Unable to compute prf key");
    match create_pub_to_sec_aux(input, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to create transfer to encrypted data due to: {}", e),
    }
}

#[wasm_bindgen(js_name = createEncryptedTransferData)]
pub fn create_encrypted_transfer_ext(
    input: &str,
    prf_key_raw: &str,
    use_deprecated: bool,
) -> String {
    let raw_type = if use_deprecated { RawBlsType::SeedDeprecated } else { RawBlsType::Bls };
    let prf_key = get_prf_key(prf_key_raw, raw_type).expect("Unable to compute prf key");
    match create_encrypted_transfer_aux(input, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to create encrypted transfer due to: {}", e),
    }
}

#[wasm_bindgen(js_name = createGenesisAccount)]
pub fn create_genesis_account_ext(
    input: &str,
    id_cred_sec_raw: &str,
    prf_key_raw: &str,
) -> String {
    let raw_type = RawBlsType::Bls;
    let prf_key = get_prf_key(prf_key_raw, raw_type).expect("Unable to compute prf key");
    let id_cred_sec = get_id_cred_sec(id_cred_sec_raw, raw_type).expect("Unable to compute prf key");
    match create_genesis_account(input, id_cred_sec, prf_key) {
        Ok(s) => s,
        Err(e) => format!("unable to create genesis account due to: {}", e),
    }
}

#[wasm_bindgen]
pub enum BakerKeyVariant {
    ADD,
    UPDATE
}

#[wasm_bindgen(js_name = generateBakerKeys)]
pub fn _generate_baker_keys(
    sender: &str,
    key_variant: BakerKeyVariant
) -> String {
    let sender = match sender.parse() {
        Ok(sender) => sender,
        Err(e) => return format!("unable to parse sender account address: {}.", e)
    };

    serde_json::to_string(&generate_baker_keys(&sender, key_variant))
        .unwrap_or_else(|e| format!("unable to serialize baker keys: {}", e))
}

#[wasm_bindgen(js_name = getAddressFromCredId)]
pub fn get_address_from_cred_id_ext(
    cred_id: &str,
) -> String {
    match get_address_from_cred_id(cred_id) {
        Ok(s) => s,
        Err(e) => format!("unable to create genesis account due to: {}", e),
    }
}

#[wasm_bindgen(js_name = getCredId)]
pub fn calculate_cred_id_ext(
    prf_key_seed: &str,
    cred_counter: u8,
    global_context: &str,
    use_deprecated: bool
) -> String {
    let raw_type = if use_deprecated { RawBlsType::SeedDeprecated } else { RawBlsType::Seed };
    let prf_key = get_prf_key(prf_key_seed, raw_type).expect("Unable to compute prf key");
    match calculate_cred_id(prf_key, cred_counter, global_context) {
        Ok(s) => s,
        Err(e) => format!("unable to calculate credId due to: {}", e),
    }
}
