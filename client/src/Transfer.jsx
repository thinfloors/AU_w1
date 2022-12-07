import { useState } from "react";
import server from "./server";
import {hashMessage, signMessage} from "../../key_utils/message-signing.js"
import {WALLET_INFO} from "../../key_utils/config.js";


function Transfer({ address, nonce, setNonce, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);
  
  async function transfer(evt) {
    evt.preventDefault();

    // Compile msg, then stringify and hash
    const msgObj = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient: recipient,
      nonce: nonce,
    }

    const msgJSON = JSON.stringify(msgObj);
    const msgHash = hashMessage(msgJSON);
    const privKey = WALLET_INFO[address]['PRIV_KEY'];

    let [msgSig, recoveryBit] = await signMessage(msgJSON, privKey);

    try {
      const {
        data: { balance, nonce },
      } = await server.post(`send`, {
        sender: address,
        transaction: msgObj, 
        msgHash: msgHash,
        signature: msgSig,
        recoveryBit: recoveryBit,
      });
      console.log('Returning from post');
      setBalance(balance);
      setNonce(nonce);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
