use wasm_bindgen::prelude::*;
use libc::c_char;
use std::ffi::{CStr, CString};

use wallet::{
    create_id_request_and_private_data_ext,
    //check_account_address_ext, combine_encrypted_amounts_ext, create_credential_ext,
    //create_encrypted_transfer_ext,
    //create_pub_to_sec_transfer_ext, create_sec_to_pub_transfer_ext, create_transfer_ext,
    //decrypt_encrypted_amount_ext, generate_accounts_ext,
};

#[wasm_bindgen]
pub fn create_id_request_and_private_data_js(input: &str) -> String {
    return unsafe {
        let cstr: CString = {
            match CString::new(input) {
                Ok(s) => s,
                Err(e) => {
                    return format!("Could not encode response: {}", e);
                }
            }
        };
        let mut success: u8 = 127;
        let output: *mut c_char =  create_id_request_and_private_data_ext(cstr.into_raw(),  &mut success);

        return match CStr::from_ptr(output).to_str() {
            Ok(s) => s.to_string(),
            Err(e) => {
                return format!("Could not decode input string: {}", e);
            }
        };
    }
}
