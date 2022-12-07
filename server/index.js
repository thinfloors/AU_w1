import express from "express";
const app = express();
import cors from "cors";
const port = 3042;

import secp from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { hashMessage } from "../key_utils/message-signing.js";
import _ from "lodash";

app.use(cors());
app.use(express.json());

// Using ethereum-style addresses
const wallet_info = {
    "0x1d768550f87334f02821524ff18b97aec144a64e": {
        balance: 100,
        nonce: 1,
    },
    "0x7eef4461f0fbbc31161dc7560d055eee22503bad": {
        balance: 75,
        nonce: 0,
    },
    "0x87d9285a408794839dc0d4e9c9b0dfd632543691": {
        balance: 50,
        nonce: 0,
    },
};

app.get("/balance/:address", (req, res) => {
    const { address } = req.params;
    const balance = wallet_info[address]["balance"] || 0;
    const nonce = wallet_info[address]["nonce"] || 0;
    res.send({ balance, nonce });
});

app.post("/send", (req, res) => {
    const { sender, transaction, msgHash, signature, recoveryBit } = req.body;

    const amount = transaction["amount"];
    const recipient = transaction["recipient"];
    const clientHash = Uint8Array.from(Object.values(msgHash));
    const clientNonce = transaction["nonce"];

    // Hash message server-side to compare to received hash, and recover public key
    // from received hash
    const txJSON = JSON.stringify(transaction);
    const txHash = hashMessage(txJSON);
    const uint8Sig = Uint8Array.from(Object.values(signature));
    const publicKey = recoverKey(txHash, uint8Sig, recoveryBit);

    // Improved check:
    // Hash of transaction received is equal to hash derived from received transaction
    // The nonce in the transaction received is equal to the current account nonce (to stop replay attacks)
    // Public key derived from signed transaction is equal to the sender
    if (
        publicKey === sender &&
        _.isEqual(clientHash, txHash) &&
        clientNonce === wallet_info[sender]["nonce"]
    ) {
        setInitialBalance(sender);
        setInitialBalance(recipient);
        if (wallet_info[sender]["balance"] < amount) {
            res.status(400).send({ message: "Not enough funds!" });
        } else {
            wallet_info[sender]["balance"] -= amount;
            wallet_info[recipient]["balance"] += amount;
            wallet_info[sender]["nonce"] += 1;
            console.log(wallet_info[sender]);
            res.send({
                balance: wallet_info[sender]["balance"],
                nonce: wallet_info[sender]["nonce"],
            });
        }
    } else {
        console.log("Incorrect key, stop stealin'");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
    if (!wallet_info[address]["balance"]) {
        wallet_info[address]["balance"] = 0;
    }
}

function recoverKey(transactionHash, signature, recoveryBit) {
    const publicKey = secp.recoverPublicKey(
        transactionHash,
        signature,
        recoveryBit
    );
    const address = "0x" + toHex(publicKey).slice(-40);
    return address;
}
