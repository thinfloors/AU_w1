import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, nonce, setNonce }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance, nonce },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
      setNonce(nonce);
    } else {
      setBalance(0);
      setNonce(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Enter your address" value={address} onChange={onChange}></input>
      </label>

      <div>
        Address: {address.slice(0,5) }...{address.slice(-5)}
      </div>

      <div className="balance">Balance: {balance}</div>
      <div className="balance">Nonce: {nonce}</div>
    </div>
  );
}

export default Wallet;
