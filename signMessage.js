// Module for signing messages

import secp from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils.js";

const privKey =
    "e77fe865f079312ffbee02c654204af522e3da5e5c58ad25e0ca0b2bee4055b5";

const transaction = {
    sender: "bob",
    amount: "1.5",
    recipient: "alice",
};

const transJSON = JSON.stringify(transaction);

// hash message
function hashMessage(message) {
    const bytes = utf8ToBytes(message);
    const hash = keccak256(bytes);

    return hash;
}

// sign message
// returns array of size 2

async function signMessage(msg, privateKey) {
    const msgHash = hashMessage(msg);
    const signature = await secp.sign(msgHash, privateKey, { recovered: true });
    return signature;
}

async function sendDetails() {
    let msgHash = hashMessage(transJSON);
    let [sig, recovery] = await signMessage(transJSON, privKey);
    //let { sig, recovery } = await signMessage(transJSON, privKey);
    console.log(`msgHash is: ${msgHash}`);
    console.log(`sig is: ${sig}`);
    console.log(`recovery is: ${recovery}`);
    recoverKey(msgHash, sig, recovery);
}

async function recoverKey(hash, signature, recoveryBit) {
    const publicKey = await secp.recoverPublicKey(hash, signature, recoveryBit);
    const address = "0x" + toHex(publicKey).slice(-40);
    console.log(`public key: ${publicKey}`);
    console.log(`in hex: ${address}`);
}

const signedMsg = signMessage(
    "testing",
    "2d065c4f6056e28c13c7be038e72e741054baea436ffbd74558b78a063cab644"
);

sendDetails();

//we can now access the promise result in doStuff, use that for deconstructing
