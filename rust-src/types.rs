use crate::{
    helpers::*,
};
use ps_sig::unknown_message::SigRetrievalRandomness;
use crypto_common::{types::KeyIndex, *};
use curve_arithmetic::{Curve, Pairing};
use std::collections::BTreeMap;
use id::types::*;

pub struct InitialAccountDataStruct {
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl PublicInitialAccountData for InitialAccountDataStruct {
    fn get_threshold(&self) -> SignatureThreshold {
        self.threshold
    }

    fn get_public_keys(&self) -> BTreeMap<KeyIndex, VerifyKey> {
        build_key_map(&self.public_keys)
    }
}

pub struct InitialAccountDataWithSignature {
    pub signature: AccountOwnershipSignature,
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl PublicInitialAccountData for InitialAccountDataWithSignature {
    fn get_threshold(&self) -> SignatureThreshold {
        self.threshold
    }

    fn get_public_keys(&self) -> BTreeMap<KeyIndex, VerifyKey> {
        build_key_map(&self.public_keys)
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

#[derive(SerdeSerialize, SerdeDeserialize)]
#[serde(bound(
    serialize = "P: Pairing",
    deserialize = "P: Pairing"
))]
pub struct RandomnessWrapper<P: Pairing> {
    #[serde(
        rename = "randomness",
        serialize_with = "base16_encode",
        deserialize_with = "base16_decode"
    )]
    pub randomness: SigRetrievalRandomness<P>,
}

pub struct AccountDataStruct {
    pub public_keys: Vec<VerifyKey>,
    pub threshold: SignatureThreshold,
}

impl PublicCredentialData for AccountDataStruct {
    fn get_public_keys(&self) -> BTreeMap<KeyIndex, VerifyKey> {
        build_key_map(&self.public_keys)
    }

    fn get_threshold(&self) -> SignatureThreshold {
        self.threshold
    }
}

#[derive(SerdeSerialize, SerdeDeserialize)]
#[serde(untagged)]
pub enum BlockItem<
        P: Pairing,
    C: Curve<Scalar = P::ScalarField>,
    AttributeType: Attribute<C::Scalar>,
    > {
    Deployment (AccountCredentialMessage<P, C, AttributeType>)
}

impl<
        P: Pairing,
    C: Curve<Scalar = P::ScalarField>,
    AttributeType: Attribute<C::Scalar>,
    > Serial for BlockItem<P, C, AttributeType> {
    fn serial<B: Buffer>(&self, out: &mut B) {
        match self {
            BlockItem::Deployment(deployment) => {
                out.write_u8(1).expect("Writing to buffer should succeed.");
                deployment.serial(out);
            }
        }
    }
}

