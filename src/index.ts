import { newKit } from '@celo/contractkit'
import {
  encodeTransaction,
  getHashFromEncoded,
  RLPEncodedTx,
  rlpEncodedTx
} from '@celo/contractkit/lib/utils/signing-utils'
import { toTxResult, TransactionResult } from '@celo/contractkit/lib/utils/tx-result'
// @ts-ignore-next-line
import { bytes as Bytes, hash as Hash, RLP } from 'eth-lib'
const detectEthereumProvider = require('@metamask/detect-provider')
const Web3 = require('web3')

function chainIdTransformationForSigning(chainId: number): number {
  return chainId * 2 + 8
}

async function _rlpEncodedTx (kit: any, web3Tx: any): Promise<RLPEncodedTx> {
  let celoTx = kit.fillTxDefaults(JSON.parse(JSON.stringify(web3Tx)))
  celoTx = await kit.fillGasPrice(celoTx)

  if (celoTx.gas == null) {
    try {
      const gas = await kit.web3.eth.estimateGas(celoTx)
      celoTx.gas = Math.round(gas * kit.config.gasInflationFactor)
    } catch (e) {
      throw new Error(e)
    }
  }

  if (celoTx.gasPrice === '0x0') {
    const gasPrice = await kit.web3.eth.getGasPrice()
    celoTx.gasPrice = gasPrice
  }

  const chainId = await kit.web3.eth.getChainId()
  celoTx.chainId = chainId
  const nonce = await kit.web3.eth.getTransactionCount(celoTx.from)
  celoTx.nonce = nonce

  return rlpEncodedTx(celoTx)
}

export class Celo {
  protected kit: any
  protected web3: any

  async init (provider: string, onAccountsChanged: (account: string) => any) {
    this.kit = newKit(provider)
    const ethr = await detectEthereumProvider()
    if (ethr) {
      if (ethr.isMetaMask) {
        this.web3 = new Web3(ethr)
        if (onAccountsChanged) {
          ethr.on('accountsChanged', onAccountsChanged)
        }
      } else {
        // TODO: other ethereum wallet did not support.
      }
    } else if ((window as { [key: string]: any })["celo"]) {
      if ((window as { [key: string]: any })["celo"].isDexFair) {
        // TODO: for DexFair
      } else if ((window as { [key: string]: any })["celo"].isDSRV) {
        // TODO: for DSRV
      }      
    }
    if (onAccountsChanged) {
      const address = await this.getAccount()
      onAccountsChanged(address)
    }
  }

  changeNetwork (provider: string) {
    this.kit = null
    this.kit = newKit(provider)
  }

  async getAccount (): Promise <string> {
    const accounts = await this.web3.eth.getAccounts() // MetaMask
    return accounts.length > 0 ? accounts[0] : ''
  }

  async estimateGas (web3Tx: any): Promise<number> {
    let celoTx = this.kit.fillTxDefaults(JSON.parse(JSON.stringify(web3Tx)))
    celoTx = await this.kit.fillGasPrice(celoTx)
  
    if (celoTx.gas == null) {
      try {
        const gas = await this.kit.web3.eth.estimateGas(celoTx)
        celoTx.gas = Math.round(gas * this.kit.config.gasInflationFactor)
      } catch (e) {
        throw new Error(e)
      }
    }
    return celoTx.gas
  }

  async sendTransaction (web3Tx: any): Promise<TransactionResult> {
    try {
      const celoTx = await _rlpEncodedTx(this.kit, web3Tx)
      const signature = await this.web3.eth.sign(getHashFromEncoded(celoTx.rlpEncode), celoTx.transaction.from) // MetaMask
  
      const v = this.kit.web3.utils.hexToNumber(`0x${signature.slice(130)}`) + chainIdTransformationForSigning(celoTx.transaction.chainId)
      const r = Buffer.from(signature.slice(2, 66), 'hex')
      const s = Buffer.from(signature.slice(66, 130), 'hex')
  
      const encodeTx = await encodeTransaction(celoTx, { v, s, r })
  
      return toTxResult(this.kit.web3.eth.sendSignedTransaction(encodeTx.raw))
    } catch (error) {
      throw new Error(error)
    }
  }
}
