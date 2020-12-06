# Celo Web Signer
A celo-web-signer allows unlimited use of celo web dapps in desktop web browsers and mobile dapp browsers.

# Installation
```npm install @dexfair/celo-web-signer```
or if you use `yarn`
```yarn add @dexfair/celo-web-signer```

# Support wallets
- [MetaMask Chrome Extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
- [MetaMask Mobile Wallet](https://play.google.com/store/apps/details?id=io.metamask) (iPHONE is not tested)
- [DSRV's Chrome Desktop Wallet](https://chrome.google.com/webstore/detail/celo-desktop-wallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh)
- [Ledger: Hardware Wallet USB](https://www.ledger.com/)
- Developing
  - dexfair dapp browser (with Valora)

# Example
## Create a Celo
```javascript
import { Celo, NETWORKS, ERC20ABI } from "@dexfair/celo-web-signer"

const celo = new Celo(NETWORKS['Mainnet'])
const onChainChanged = (network) => {
  // do something
}
const onAccountsChanged = (account) => {
  // do something
}
await celo.init(onChainChanged, onAccountsChanged)
```

## changeNetwork
```javascript
await celo.changeNetwork(NETWORKS['Alfajores'])
```

## getAccount
```javascript
const account = await celo.getAccount()
```

## estimateGas
```javascript
const tx = {
  from: myAddress,
  to: someAddress,
  value: oneGold,
  data: someData
}
const gas = await celo.estimateGas(tx)
```

## estimateFee
```javascript
const tx = {
  from: myAddress,
  to: someAddress,
  value: oneGold,
  data: someData
}
const fee = await celo.estimateFee(tx)
```

## sendTransaction
```javascript
const tx = {
  from: myAddress,
  to: someAddress,
  value: oneGold,
  data: someData
}
const txReceipt = await celo.sendTransaction(tx)
```

# Sample
[celo-remix-plugin](https://github.com/dexfair/celo-remix-plugin)
