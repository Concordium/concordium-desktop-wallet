use crate::{
    helpers::*,
    types::*,
};
use dodis_yampolskiy_prf as prf;
use pairing::bls12_381::{Bls12, G1};
use serde_json::{from_str, Value as SerdeValue};
use std::collections::BTreeMap;
type ExampleCurve = G1;

use rand::thread_rng;

use anyhow::{Result, anyhow};
use id::{
    account_holder::*,
    secret_sharing::Threshold,
    types::*,
    constants::{BaseField, AttributeKind},
};
use pedersen_scheme::Value;

type ExampleAttributeList = AttributeList<BaseField, AttributeKind>;

/**
 * creates an AccountCredentialWithoutProofs and the address, which is generated from the credId of the credential.
 * @input is a json string containing:
 * arInfo: ArInfo<ExampleCurve>
 * ipInfo: IpInfo<Bls12>
 * global: GlobalContext<ExampleCurve>
 * credentialNumber: u8
 * publicKeys: Vec<VerifyKey>
 * threshold: SignatureThreshold
 * currentYearMonth: YearMonth
 *
 * Additionally it takes the seeds for the id_cred_sec and prf_key as inputs.
**/
pub fn create_genesis_account (
    input: &str,
    id_cred_sec_seed: &str,
    prf_key_seed: &str,
) -> Result<String> {
    let v: SerdeValue = from_str(input)?;

    let mut csprng = thread_rng();

    let ar_info: ArInfo<ExampleCurve> = try_get(&v, "arInfo")?;
    let ip_info: IpInfo<Bls12> = try_get(&v, "ipInfo")?;
    let global_context: GlobalContext<ExampleCurve> = try_get(&v, "global")?;
    let cred_counter: u8 = try_get(&v, "credentialNumber")?;

    let id_cred_sec = Value::new(generate_bls_key(id_cred_sec_seed)?);
    let prf_key: prf::SecretKey<ExampleCurve> = prf::SecretKey::new(generate_bls_key(prf_key_seed)?);

    let initial_acc_data = InitialAccountDataStruct {
        public_keys: try_get(&v, "publicKeys")?,
        threshold: try_get(&v, "threshold")?,
    };

    let cred_id = generate_cred_id(&prf_key, cred_counter, &global_context)?;

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
            None => return Err(anyhow!("failed building pub_info_for_ip.")),
        };

    let ah_info = CredentialHolderInfo::<ExampleCurve> {
        id_cred: IdCredentials { id_cred_sec },
    };

    // Expire in 1 year from now.
    let created_at: YearMonth = try_get(&v, "currentYearMonth")?;
    let valid_to = {
        let mut now: YearMonth = try_get(&v, "currentYearMonth")?;
        now.year += 5; // Credentials valid to 5 years from creation
        now
    };

    // no attributes
    let alist = BTreeMap::new();
    let aci = AccCredentialInfo {
        cred_holder_info: ah_info,
        prf_key,
    };

    // We need to choose some value, to compute commitments,
    // however the commitment is never opened so we just choose some large value.
    let max_accounts = 238;

    let attributes = ExampleAttributeList {
        valid_to,
        created_at,
        max_accounts,
        alist,
        _phantom: Default::default(),
    };

    let policy = Policy {
        valid_to:   attributes.valid_to,
        created_at: attributes.created_at,
        policy_vec: BTreeMap::<_, AttributeKind>::new(),
        _phantom:   Default::default(),
    };

    // Anonymity revocation treshold, set to 1 because we only have asingle dummy anonymity revoker.
    let revocation_threshold = Threshold(1);

    let cdv = CredentialDeploymentValues {
        cred_key_info: acc_data.vk_acc,
        cred_id,
        ip_identity: ip_info.ip_identity,
        threshold: revocation_threshold,
        ar_data,
        policy,
    };

    let chosen_ars = {
        let mut chosen_ars = BTreeMap::new();
        chosen_ars.insert(ar_info.ar_identity, ar_info.clone());
        chosen_ars
    };

    let (_, cmm_id_cred_sec_sharing_coeff, cmm_coeff_randomness) = compute_sharing_data(
        &aci.cred_holder_info.id_cred.id_cred_sec,
        &chosen_ars,
        revocation_threshold,
        &global_context.on_chain_commitment_key,
    );

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

    let address = AccountAddress::new(&cdv.cred_id);
    let cdvc = AccountCredentialWithoutProofs::Normal { cdv, commitments };

    let output = json!({
        "credential": cdvc,
        "generatedAddress": address
    });
    Ok(output.to_string())
}
