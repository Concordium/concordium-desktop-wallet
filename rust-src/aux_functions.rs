use crate::external_functions::BakerKeyVariant;
use crate::{
    helpers::*,
    types::*,
};
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
use crypto_common::{types::{KeyIndex, Amount, TransactionTime}, *};
use encrypted_transfers::types::{AggregatedDecryptedAmount, EncryptedAmount};
use elgamal::BabyStepGiantStep;
use dodis_yampolskiy_prf::secret as prf;
use hex::FromHex;
use pairing::bls12_381::{Bls12, Fr, G1};
use serde_json::{from_str, Value as SerdeValue};
use std::{cmp::max, collections::BTreeMap, convert::TryInto};
type ExampleCurve = G1;
use ed25519_dalek as ed25519;
use eddsa_ed25519::dlog_ed25519;
use random_oracle::RandomOracle;
use sha2::{Digest, Sha256};

use rand::thread_rng;

use ::failure::Fallible;
use id::{
    account_holder::{build_pub_info_for_ip, generate_pio, create_unsigned_credential},
    secret_sharing::Threshold,
    types::*,
    ffi::AttributeKind,
};
use pedersen_scheme::value::Value;

pub fn build_pub_info_for_ip_aux(
    input: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let id_cred_sec = Value::new(generate_bls_key(id_cred_sec_seed)?);
    let prf_key = prf::SecretKey::new(generate_bls_key(prf_key_seed)?);

    let initial_acc_data = InitialAccountDataStruct {
        public_keys: try_get(&v, "publicKeys")?,
        threshold: try_get(&v, "threshold")?,
    };

    let pub_info_for_ip =
        match build_pub_info_for_ip(&global_context, &id_cred_sec, &prf_key, &initial_acc_data) {
            Some(x) => x,
            None => return Err(format_err!("failed building pub_info_for_ip.")),
        };

    let response = json!(pub_info_for_ip);
    Ok(response.to_string())
}

pub fn create_id_request_aux(
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

    let id_cred_sec = Value::new(generate_bls_key(id_cred_sec_seed)?);
    let prf_key = prf::SecretKey::new(generate_bls_key(prf_key_seed)?);

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

    let randomness = RandomnessWrapper { randomness };

    let response = json!({
        "idObjectRequest": Versioned::new(VERSION_0, pio),
        "randomness_wrapped": randomness,
    });
    Ok(response.to_string())
}

pub fn generate_unsigned_credential_aux(
    input: &str
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;
    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;

    let ars_infos: BTreeMap<ArIdentity, ArInfo<ExampleCurve>> = try_get(&v, "arsInfos")?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let id_object: IdentityObject<Bls12, ExampleCurve, AttributeKind> =
        try_get(&v, "identityObject")?;

    let tags: Vec<AttributeTag> = try_get(&v, "revealedAttributes")?;

    let cred_num: u8 = try_get(&v, "credentialNumber")?;

    let public_keys: Vec<VerifyKey> = try_get(&v, "publicKeys")?;
    let cred_key_info = CredentialPublicKeys { //This is assumed to be an new account TODO: handle existing account
        keys: build_key_map(&public_keys),
        threshold: try_get(&v, "threshold")?,
    };

    let id_string: String = try_get(&v, "idCredSec")?;
    let id_cred_sec = Value::new(generate_bls_key(&id_string)?);

    let prf_key_string: String = try_get(&v, "prfKey")?;
    let prf_key = prf::SecretKey::new(generate_bls_key(&prf_key_string)?);

    let chi = CredentialHolderInfo::<ExampleCurve> {
        id_cred: IdCredentials { id_cred_sec },
    };

    let aci = AccCredentialInfo {
        cred_holder_info: chi,
        prf_key,
    };

    let randomness_wrapped: RandomnessWrapper<Bls12> = try_get(&v, "randomness")?;

    let id_use_data = IdObjectUseData {
        aci,
        randomness: randomness_wrapped.randomness
    };

    let mut policy_vec = std::collections::BTreeMap::new();
    for tag in tags {
        if let Some(att) = id_object.alist.alist.get(&tag) {
            if policy_vec.insert(tag, att.clone()).is_some() {
                bail!("Cannot reveal an attribute more than once.")
            }
        } else {
            bail!("Cannot reveal an attribute which is not part of the attribute list.")
        }
    }

    let policy = Policy {
        valid_to: id_object.alist.valid_to,
        created_at: id_object.alist.created_at,
        policy_vec,
        _phantom: Default::default(),
    };

    let context = IPContext::new(&ip_info, &ars_infos, &global_context);

    let address: Option<AccountAddress> = match try_get(&v, "address") {
        Ok(x) => Some(x),
        Err(_) => None
    };

    let cdi = create_unsigned_credential(
        context,
        &id_object,
        &id_use_data,
        cred_num,
        policy,
        cred_key_info,
        address.as_ref()
    )?;

    let response = json!(cdi);

    Ok(response.to_string())
}

pub fn get_credential_deployment_info_aux(
    signature: &str,
    unsigned_info: &str,
) -> Fallible<String> {
    console_error_panic_hook::set_once();
    let v: SerdeValue = from_str(unsigned_info)?;
    let values: CredentialDeploymentValues<ExampleCurve, AttributeKind> = from_str(unsigned_info)?;
    let proofs: IdOwnershipProofs<Bls12, ExampleCurve> = try_get(&v, "proofs")?;
    let unsigned_credential_info = UnsignedCredentialDeploymentInfo::<Bls12, ExampleCurve, AttributeKind>{
        values, proofs
    };

    let signature_bytes = <[u8; 64]>::from_hex(signature).expect("Decoding failed");

    let mut signatures = BTreeMap::new();
    signatures.insert(KeyIndex(0), ed25519::Signature::new(signature_bytes).into());

    let proof_acc_sk = AccountOwnershipProof {
        sigs: signatures,
    };

    let cdp = CredDeploymentProofs {
        id_proofs: unsigned_credential_info.proofs,
        proof_acc_sk,
    };

    let cdi = CredentialDeploymentInfo {
        values: unsigned_credential_info.values,
        proofs: cdp,
    };

    let cdi_json = json!(cdi);

    Ok(cdi_json.to_string())
}

pub fn get_credential_deployment_details_aux(
    signature: &str,
    unsigned_info: &str,
    expiry: u64,
) -> Fallible<String> {
    console_error_panic_hook::set_once();
    let v: SerdeValue = from_str(unsigned_info)?;
    let values: CredentialDeploymentValues<ExampleCurve, AttributeKind> = from_str(unsigned_info)?;
    let proofs: IdOwnershipProofs<Bls12, ExampleCurve> = try_get(&v, "proofs")?;
    let unsigned_credential_info = UnsignedCredentialDeploymentInfo::<Bls12, ExampleCurve, AttributeKind>{
        values, proofs
    };

    let signature_bytes = <[u8; 64]>::from_hex(signature).expect("Decoding failed");

    let mut signatures = BTreeMap::new();
    signatures.insert(KeyIndex(0), ed25519::Signature::new(signature_bytes).into());

    let proof_acc_sk = AccountOwnershipProof {
        sigs: signatures,
    };

    let cdp = CredDeploymentProofs {
        id_proofs: unsigned_credential_info.proofs,
        proof_acc_sk,
    };

    let cdi = CredentialDeploymentInfo {
        values: unsigned_credential_info.values,
        proofs: cdp,
    };

    let cdi_json = json!(cdi);

    let address = AccountAddress::new(&cdi.values.cred_id);

    let acc_cred = AccountCredential::Normal{cdi};

    let credential_message = AccountCredentialMessage {
        credential: acc_cred,
        message_expiry: TransactionTime{ seconds: expiry }
    };

    let block_item = BlockItem::Deployment(credential_message);

    let hash = {
        let info_as_bytes = &to_bytes(&block_item);
        hex::encode(Sha256::digest(info_as_bytes))
    };

    let hex = {
        let versioned =  Versioned::new(VERSION_0, block_item);
        let versioned_as_bytes = &to_bytes(&versioned);
        hex::encode(versioned_as_bytes)
    };

    let response = json!({
        "credInfo": cdi_json,
        "hex": hex,
        "hash": hash,
        "address": address
    });

    Ok(response.to_string())
}

pub fn decrypt_amounts_aux(
    input: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;
    let encrypted_amounts: Vec<EncryptedAmount<ExampleCurve>> = try_get(&v, "encryptedAmounts")?;

    let prf_key_string: String = try_get(&v, "prfKey")?;
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls_key(&prf_key_string)?);

    let credential_number: u8 = try_get(&v, "credentialNumber")?;

    let scalar: Fr = prf_key.prf_exponent(credential_number)?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;
    let secret_key = elgamal::SecretKey {
        generator: *global_context.elgamal_generator(),
        scalar,
    };

    let m = 1 << 16;
    let table = BabyStepGiantStep::new(global_context.encryption_in_exponent_generator(), m);

    let amounts: Vec<Amount> = encrypted_amounts.iter().map(|encrypted_amount| {
        encrypted_transfers::decrypt_amount::<ExampleCurve>(
            &table,
            &secret_key,
            &encrypted_amount,
        )
    }).collect();

    Ok(json!(amounts).to_string())
}

pub fn create_sec_to_pub_aux(
    input: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let prf_key_string: String = try_get(&v, "prfKey")?;
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls_key(&prf_key_string)?);

    let account_number: u8 = try_get(&v, "accountNumber")?;

    let scalar: Fr = prf_key.prf_exponent(account_number)?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let secret_key = elgamal::SecretKey {
        generator: *global_context.elgamal_generator(),
        scalar,
    };

    let incoming_amounts: Vec<EncryptedAmount<ExampleCurve>> = try_get(&v, "incomingAmounts")?;
    let self_amount: EncryptedAmount<ExampleCurve> = try_get(&v, "encryptedSelfAmount")?;
    let agg_index: u64 = try_get(&v, "aggIndex")?;
    let to_transfer: Amount = try_get(&v, "amount")?;

    let input_amount = incoming_amounts.iter().fold(self_amount, |acc, amount| encrypted_transfers::aggregate(&acc,amount));
    let m = 1 << 16;
    let table = BabyStepGiantStep::new(global_context.encryption_in_exponent_generator(), m);

    let decrypted_amount =
        encrypted_transfers::decrypt_amount::<ExampleCurve>(
        &table,
        &secret_key,
        &input_amount,
    );

    let agg_decrypted_amount = AggregatedDecryptedAmount {
        agg_encrypted_amount: input_amount,
        agg_amount: decrypted_amount,
        agg_index
    };

    let mut csprng = thread_rng();

    let payload =encrypted_transfers::make_sec_to_pub_transfer_data(
        &global_context,
        &secret_key,
        &agg_decrypted_amount,
        to_transfer,
        &mut csprng,
    );

    let payload = match payload {
        Some(payload) => payload,
        None => bail!("Could not produce payload."),
    };

    let decrypted_remaining =
        encrypted_transfers::decrypt_amount::<ExampleCurve>(
            &table,
            &secret_key,
            &payload.remaining_amount,
        );

    let response = json!({
        "payload": payload,
        "decryptedRemaining": decrypted_remaining,
        });

    Ok(response.to_string())
}

pub fn create_pub_to_sec_aux(
    input: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let prf_key_string: String = try_get(&v, "prfKey")?;
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls_key(&prf_key_string)?);

    let account_number: u8 = try_get(&v, "accountNumber")?;

    let scalar: Fr = prf_key.prf_exponent(account_number)?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let secret_key = elgamal::SecretKey {
        generator: *global_context.elgamal_generator(),
        scalar,
    };

    let incoming_amounts: Vec<EncryptedAmount<ExampleCurve>> = try_get(&v, "incomingAmounts")?;
    let self_amount: EncryptedAmount<ExampleCurve> = try_get(&v, "encryptedSelfAmount")?;
    let to_transfer: Amount = try_get(&v, "amount")?;

    let to_transfer_encrypted = encrypted_transfers::encrypt_amount_with_fixed_randomness(&global_context, to_transfer);

    let current_amount = incoming_amounts.iter().fold(self_amount, |acc, amount| encrypted_transfers::aggregate(&acc,amount));
    let m = 1 << 16;
    let table = BabyStepGiantStep::new(global_context.encryption_in_exponent_generator(), m);

    let remaining_amount = encrypted_transfers::aggregate(&current_amount, &to_transfer_encrypted);

    let decrypted_remaining =
        encrypted_transfers::decrypt_amount::<ExampleCurve>(
            &table,
            &secret_key,
            &remaining_amount,
        );

    let response = json!({
        "newSelfEncryptedAmount": remaining_amount,
        "decryptedRemaining": decrypted_remaining,
        });

    Ok(response.to_string())
}

pub fn create_encrypted_transfer_aux(
    input: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let prf_key_string: String = try_get(&v, "prfKey")?;
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls_key(&prf_key_string)?);

    let account_number: u8 = try_get(&v, "accountNumber")?;

    let scalar: Fr = prf_key.prf_exponent(account_number)?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let secret_key = elgamal::SecretKey {
        generator: *global_context.elgamal_generator(),
        scalar,
    };

    let receiver_pk = try_get(&v, "receiverPublicKey")?;

    let incoming_amounts: Vec<EncryptedAmount<ExampleCurve>> = try_get(&v, "incomingAmounts")?;
    let self_amount: EncryptedAmount<ExampleCurve> = try_get(&v, "encryptedSelfAmount")?;
    let agg_index: u64 = try_get(&v, "aggIndex")?;
    let to_transfer: Amount = try_get(&v, "amount")?;

    let input_amount = incoming_amounts.iter().fold(self_amount, |acc, amount| encrypted_transfers::aggregate(&acc,amount));
    let m = 1 << 16;
    let table = BabyStepGiantStep::new(global_context.encryption_in_exponent_generator(), m);

    let decrypted_amount =
        encrypted_transfers::decrypt_amount::<ExampleCurve>(
            &table,
            &secret_key,
            &input_amount,
        );

    let agg_decrypted_amount = AggregatedDecryptedAmount {
        agg_encrypted_amount: input_amount,
        agg_amount: decrypted_amount,
        agg_index
    };

    let mut csprng = thread_rng();

    let payload =encrypted_transfers::make_transfer_data(
        &global_context,
        &receiver_pk,
        &secret_key,
        &agg_decrypted_amount,
        to_transfer,
        &mut csprng,
    );

    let payload = match payload {
        Some(payload) => payload,
        None => bail!("Could not produce payload."),
    };

    let decrypted_remaining =
        encrypted_transfers::decrypt_amount::<ExampleCurve>(
            &table,
            &secret_key,
            &payload.remaining_amount,
        );

    let response = json!({
        "payload": payload,
        "remaining": payload.remaining_amount,
        "decryptedRemaining": decrypted_remaining,
        });

        Ok(response.to_string())
}

#[derive(SerdeSerialize)]
#[serde(rename_all = "camelCase")]
pub struct BakerKeys {
    #[serde(serialize_with = "base16_encode")]
    election_secret: ed25519::SecretKey,
    #[serde(serialize_with = "base16_encode")]
    election_public: ed25519::PublicKey,
    #[serde(serialize_with = "base16_encode")]
    signature_secret: ed25519::SecretKey,
    #[serde(serialize_with = "base16_encode")]
    signature_public: ed25519::PublicKey,
    #[serde(serialize_with = "base16_encode")]
    aggregation_secret: aggregate_sig::SecretKey<Bls12>,
    #[serde(serialize_with = "base16_encode")]
    aggregation_public: aggregate_sig::PublicKey<Bls12>,
    #[serde(serialize_with = "base16_encode")]
    proof_election: dlog_ed25519::Ed25519DlogProof,
    #[serde(serialize_with = "base16_encode")]
    proof_signature: dlog_ed25519::Ed25519DlogProof,
    #[serde(serialize_with = "base16_encode")]
    proof_aggregation: aggregate_sig::Proof<Bls12>
}

pub fn generate_baker_keys(sender: &AccountAddress, key_variant: BakerKeyVariant) -> BakerKeys {
    let mut csprng = thread_rng();
    let election = ed25519::Keypair::generate(&mut csprng);
    let signature = ed25519::Keypair::generate(&mut csprng);
    let aggregation_secret = aggregate_sig::SecretKey::<Bls12>::generate(&mut csprng);
    let aggregation_public = aggregate_sig::PublicKey::<Bls12>::from_secret(aggregation_secret);

    let mut challenge = match key_variant {
        BakerKeyVariant::ADD => b"addBaker".to_vec(),
        BakerKeyVariant::UPDATE => b"updateBakerKeys".to_vec()
    };

    sender.serial(&mut challenge);
    election.public.serial(&mut challenge);
    signature.public.serial(&mut challenge);
    aggregation_public.serial(&mut challenge);

    let proof_election = dlog_ed25519::prove_dlog_ed25519(&mut RandomOracle::domain(&challenge), &election.public, &election.secret);
    let proof_signature = dlog_ed25519::prove_dlog_ed25519(&mut RandomOracle::domain(&challenge), &signature.public, &signature.secret);
    let proof_aggregation = aggregation_secret.prove(&mut csprng, &mut RandomOracle::domain(&challenge));

    BakerKeys {
        election_secret: election.secret,
        election_public: election.public,
        signature_secret: signature.secret,
        signature_public: signature.public,
        aggregation_secret,
        aggregation_public,
        proof_election,
        proof_signature,
        proof_aggregation
    }
}

pub fn get_address_from_cred_id(cred_id: &str) -> Fallible<String> {
    let cred_id_parsed: ExampleCurve = base16_decode_string(cred_id)?;
    Ok(AccountAddress::new(&cred_id_parsed).to_string())
}

pub fn calculate_cred_id(
    prf_key_seed: &str,
    cred_counter: u8,
    global_context: &str
) -> Fallible<String> {
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls_key(&prf_key_seed)?);

    let global_context = from_str(global_context)?;

    let cred_id = generate_cred_id::<ExampleCurve>(&prf_key, cred_counter, &global_context)?;

    Ok(base16_encode_string(&cred_id))
}
