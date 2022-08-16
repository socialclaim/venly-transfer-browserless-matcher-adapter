# Venly transfer browserless matcher adapter


Use this external adapter to verify the contents of a HTML element in a web page, in a DOM-enabled environment and withdraw funds from a venly-managed wallet

This external adapter requires an instance of [browserless](https://www.browserless.io/) running self-hosted or in the cloud. 
## Input Params

- `url`, the url to visit
- `selector`, CSS the selector in the page to verify,
- `challenge`, the string to find in the HTML element
- `recipient`, the address to withdraw funds to
- `walletID`: the id of the wallet to withdraw funds from

## Output
Returns `true` if the challenge is found in the selector and the transaction is executed
```json
{
 "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
 "data": {
  "result": true
 },
 "statusCode": 200
}
```

## Live on a BSC Testnet node

If you wish to test this adapter in a test environment, please use the following oracle address and job ID :

Oracle address : [0xFA776B1C972578c034B88e880F2F65729b43e9B0](https://mumbai.polygonscan.com/address/0xFA776B1C972578c034B88e880F2F65729b43e9B0)

Use in solidity :
```solidity
  // configuration
  address oracle = 0xFA776B1C972578c034B88e880F2F65729b43e9B0;
  bytes32 jobId = "154067c0791e4b738cbc7edde49139be";
  uint256 oracle_fee = 0.1 * 10 ** 18;

  // Submit your request to the oracle
  Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
  request.add("url", "my_url"); 
  request.add("selector", "my_css_selector"); 
  request.add("challenge", "my_challenge");
  request.add("walletID", bytes32ToString("wallet_id"));
  request.add("recipient", toAsciiString("recipient"));
  return sendChainlinkRequestTo(oracle, request, oracle_fee);

  // Callback your request is fulfilled
  function fulfill(bytes32 _requestId, bool _value) public recordChainlinkFulfillment(_requestId)
  {
    _value // true if the verification & transfer were successful
  }
}

```

## Install Locally

Install dependencies:

```bash
npm install
```

Required env variables:

```bash
export BROWSERLESS_URL="http://localhost:3000"
export VUE_APP_VENLY_API_URL="https://api-wallet-staging.venly.io"
export VUE_APP_VENLY_LOGIN_URL="https://login-staging.arkane.network"
export VUE_APP_VENLY_CLIENT_ID="Testaccount-capsule"
export VUE_APP_SECRET_ID="xxxxx"
export VUE_APP_APPLICATION_ID="xxxxx"
export VUE_APP_MATIC_GAS_STATION_URL="https://gasstation-mumbai.matic.today/v2"
```

Run : (defaults to port 8080):

```bash
npm run start
```

## Notes

Any error during the browserless runtime (element not found, timeout, or other errors) will result in a successful request `false` result
