#[macro_use]
extern crate failure;
#[macro_use]
extern crate serde_json;
extern crate console_error_panic_hook;
extern crate hex;

use ps_sig::unknown_message::SigRetrievalRandomness;
use crypto_common::*;
use curve_arithmetic::{Curve, Pairing};
use dodis_yampolskiy_prf::secret as prf;
use hex::FromHex;
use pairing::bls12_381::{Bls12, Fr, G1};
use serde_json::{from_str, from_value, Value as SerdeValue};
use std::{cmp::max, collections::BTreeMap, convert::TryInto};
use wasm_bindgen::prelude::*;
type ExampleCurve = G1;
use ed25519_dalek as ed25519;
use either::Either;

use ::failure::Fallible;
use id::{
    account_holder::{build_pub_info_for_ip, generate_pio, create_unsigned_credential},
    secret_sharing::Threshold,
    types::*,
    ffi::AttributeKind,
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

    let randomness = RandomnessWrapper { randomness };

    let response = json!({
        "idObjectRequest": Versioned::new(VERSION_0, pio),
        "randomness": randomness,
    });
    Ok(response.to_string())
}

struct InitialAccountDataStruct {
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl PublicInitialAccountData for InitialAccountDataStruct {
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

impl PublicInitialAccountData for InitialAccountDataWithSignature {
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

#[wasm_bindgen]
pub fn generate_unsigned_credential_ext(
    input: &str
) -> String {
    match generate_unsigned_credential_aux(input) {
        Ok(s) => s,
        Err(e) => format!("unable to generate unsigned credential due to: {}", e),
    }
}

fn generate_unsigned_credential_aux(
    input: &str
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;
    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;

    let ars_infos: BTreeMap<ArIdentity, ArInfo<ExampleCurve>> = try_get(&v, "arsInfos")?;

    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let id_object: IdentityObject<Bls12, ExampleCurve, AttributeKind> =
        try_get(&v, "identityObject")?;

    let tags: Vec<AttributeTag> = try_get(&v, "revealedAttributes")?;

    let acc_num: u8 = try_get(&v, "accountNumber")?;

    let acc_data = AccountDataStruct { //This is assumed to be an new account TODO: handle existing account
        public_keys: try_get(&v, "publicKeys")?,
        threshold: try_get(&v, "threshold")?,
    };


    let id_string: String = try_get(&v, "idCredSec")?;
    let id_cred_sec = Value::new(generate_bls(&id_string)?);

    let prf_key_string: String = try_get(&v, "prfKey")?;
    let prf_key = prf::SecretKey::new(generate_bls(&prf_key_string)?);

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

    let cdi = create_unsigned_credential(
        context,
        &id_object,
        &id_use_data,
        acc_num,
        policy,
        &acc_data,
    )?;

    let response = json!(cdi);

    Ok(response.to_string())
}

#[derive(SerdeSerialize, SerdeDeserialize)]
#[serde(bound(
    serialize = "P: Pairing",
    deserialize = "P: Pairing"
))]
struct RandomnessWrapper<P: Pairing> {
    #[serde(
        rename = "randomness",
        serialize_with = "base16_encode",
        deserialize_with = "base16_decode"
    )]
    pub randomness: SigRetrievalRandomness<P>,
}

struct AccountDataStruct {
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl PublicAccountData for AccountDataStruct {
    fn get_existing(&self) ->  Either<SignatureThreshold, AccountAddress> { Either::Left(self.threshold) }

    fn get_public_keys(&self) -> Vec<VerifyKey> {
        (&self.public_keys).to_vec()
    }
}


#[wasm_bindgen]
pub fn get_credential_deployment_info_ext(
    input: &str
) -> String {
    match get_credential_deployment_info_aux(input) {
        Ok(s) => s,
        Err(e) => format!("unable to get credential due to: {}", e),
    }
}

fn get_credential_deployment_info_aux(
    input: &str
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let unsigned_credential_info: UnsignedCredentialDeploymentInfo<Bls12, ExampleCurve, AttributeKind>  = try_get(&v, "unsignedInfo")?;
    let signature = try_get(&v, "signature")?;

    let unsigned_proofs = unsigned_credential_info.proofs;

    let cdp = CredDeploymentProofs {
        sig: unsigned_proofs.sig,
        commitments: unsigned_proofs.commitments,
        challenge: unsigned_proofs.challenge,
        proof_id_cred_pub: unsigned_proofs.proof_id_cred_pub,
        proof_reg_id: unsigned_proofs.proof_reg_id,
        proof_ip_sig: unsigned_proofs.proof_ip_sig,
        proof_acc_sk: signature,
        cred_counter_less_than_max_accounts: unsigned_proofs.cred_counter_less_than_max_accounts,
    };

    let info = CredentialDeploymentInfo {
        values: unsigned_credential_info.values,
        proofs: cdp,
    };

    let response = json!(info);

    Ok(response.to_string())
}
