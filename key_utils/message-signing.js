//Module for hashing and signing messages

import * as secp from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";

// hash message
function hashMessage(message) {
    const bytes = utf8ToBytes(message);
    const hash = keccak256(bytes);

    return hash;
}

//sign message, only return signature
async function signMessage(msg, privateKey) {
    const msgHash = hashMessage(msg);
    const signature = await secp.sign(msgHash, privateKey, { recovered: true });
    return signature;
}

export { hashMessage, signMessage };
