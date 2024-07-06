mod utils;
use sha1::{Sha1, Digest};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Sha1Hasher {
    hasher: Sha1,
}

#[wasm_bindgen]
impl Sha1Hasher {
    pub fn new() -> Sha1Hasher {
        let hasher = Sha1::new();
        Sha1Hasher { hasher }
    }

    #[inline(always)]
    pub fn update(&mut self, data: &[u8]) {
        self.hasher.update(data);
    }

    pub fn digest(data: &str) -> String {
        let hash = Sha1::digest(data.as_bytes());
        format!("{:x}", hash)
    }

    pub fn finalize(self) -> String {
        format!("{:x}", self.hasher.finalize())
    }
}
