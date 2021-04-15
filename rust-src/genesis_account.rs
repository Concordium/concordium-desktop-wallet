use crate::{
    helpers::*,
    types::*,
};
use crypto_common::{types::KeyIndex, *};
use dodis_yampolskiy_prf::secret as prf;
use pairing::bls12_381::{Bls12, G1};
use serde_json::{from_str, Value as SerdeValue};
use std::collections::BTreeMap;
type ExampleCurve = G1;

use rand::thread_rng;

use ::failure::Fallible;
use id::{
    account_holder::*,
    secret_sharing::Threshold,
    types::*,
    ffi::AttributeKind,
    constants::BaseField,
};
use pedersen_scheme::value::Value;

type ExampleAttributeList = AttributeList<BaseField, AttributeKind>;

pub fn create_genesis_account (
    input: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> Fallible<String> {
    let v: SerdeValue = from_str(input)?;

    let mut csprng = thread_rng();

    let ar_info: ArInfo<ExampleCurve> = try_get(&v, "arInfo")?;
    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;
    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;

    let id_cred_sec = Value::new(generate_bls(id_cred_sec_seed)?);
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls(prf_key_seed)?);

    let initial_acc_data = InitialAccountDataStruct {
        public_keys: try_get(&v, "publicKeys")?,
        threshold: try_get(&v, "threshold")?,
    };

    let ar_data = {
        let mut ar_data = BTreeMap::new();
        ar_data.insert(ar_info.ar_identity, ChainArData {
            enc_id_cred_pub_share: ar_info
                .ar_public_key
                .encrypt_exponent(&mut csprng, &prf_key.to_value()),
        });
        ar_data
    };

    let acc_data =
        match build_pub_info_for_ip(&global_context, &id_cred_sec, &prf_key, &initial_acc_data) {
            Some(x) => x,
            None => return Err(format_err!("failed building pub_info_for_ip.")),
        };

    let ah_info = CredentialHolderInfo::<ExampleCurve> {
        id_cred: IdCredentials { id_cred_sec },
    };

    // only a single dummy anonymity revoker.
    let threshold = Threshold(1);

    // Expire in 1 year from now.
    let created_at: YearMonth = try_get(&v, "currentYearMonth")?;
    let valid_to = {
        let mut now: YearMonth = try_get(&v, "currentYearMonth")?;
        now.year += 1;
        now
    };

    // no attributes
    let alist = BTreeMap::new();
    let aci = AccCredentialInfo {
        cred_holder_info: ah_info,
        prf_key,
    };

    let attributes = ExampleAttributeList {
        valid_to,
        created_at,
        max_accounts: 238,
        alist,
        _phantom: Default::default(),
    };

    let policy = Policy {
        valid_to:   attributes.valid_to,
        created_at: attributes.created_at,
        policy_vec: BTreeMap::<_, AttributeKind>::new(),
        _phantom:   Default::default(),
    };

    let cdv = CredentialDeploymentValues {
        cred_key_info: acc_data.vk_acc,
        cred_id: acc_data.reg_id,
        ip_identity: ip_info.ip_identity,
        threshold,
        ar_data,
        policy,
    };

    let address = AccountAddress::new(&cdv.cred_id);

    let chosen_ars = {
        let mut chosen_ars = BTreeMap::new();
        chosen_ars.insert(ar_info.ar_identity, ar_info.clone());
        chosen_ars
    };

    let (_, cmm_id_cred_sec_sharing_coeff, cmm_coeff_randomness) = compute_sharing_data(
        &aci.cred_holder_info.id_cred.id_cred_sec,
        &chosen_ars,
        threshold,
        &global_context.on_chain_commitment_key,
    );

    let cred_counter = 0;

    let policy = Policy {
        valid_to:   attributes.valid_to,
        created_at: attributes.created_at,
        policy_vec: BTreeMap::<_, AttributeKind>::new(),
        _phantom:   Default::default(),
    };

    let (commitments, _) = compute_commitments(
        &global_context.on_chain_commitment_key,
        &attributes,
        &aci.prf_key,
        cred_counter,
        &cmm_id_cred_sec_sharing_coeff,
        cmm_coeff_randomness,
        &policy,
        &mut csprng,
    )
        .expect("Could not compute commitments.");

    let cdvc = AccountCredentialWithoutProofs::Normal { cdv, commitments };


    let versioned_credentials = {
        let mut credentials = BTreeMap::new();
        credentials.insert(KeyIndex(0), cdvc);
        Versioned::new(VERSION_0, credentials)
    };

    let public_account_data = json!({
        "schemeId": "Ed25519",
        "address": address,
        "accountThreshold": 1, // only a single credential
        "credentials": versioned_credentials,
    });

    Ok(public_account_data.to_string())
}
