import { newKit } from '@celo/contractkit'
import {
  encodeTransaction,
  getHashFromEncoded,
  RLPEncodedTx,
  rlpEncodedTx
} from '@celo/contractkit/lib/utils/signing-utils'
import { toTxResult, TransactionResult } from '@celo/contractkit/lib/utils/tx-result'
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core'
import detectEthereumProvider from '@metamask/detect-provider'
// @ts-ignore-next-line
import { bytes as Bytes, hash as Hash, RLP } from 'eth-lib'
import { ERC20ABI as erc20} from './erc20.abi'

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

export const NETWORKS: any = {
  Mainnet: { provider: 'https://rc1-forno.celo-testnet.org', blockscout: 'https://explorer.celo.org' },
  Alfajores: { provider: 'https://alfajores-forno.celo-testnet.org', blockscout: 'https://alfajores-blockscout.celo-testnet.org' },
  Baklava: { provider: 'https://baklava-forno.celo-testnet.org', blockscout: 'https://baklava-blockscout.celo-testnet.org' }
}

export const ERC20ABI: Array<object> = erc20;

export class Celo {
  protected kit: any
  protected web3: any
  protected provider: any

  protected contracts: any = {
    erc20: null,
    goldToken: null,
    stableToken: null,
    exchange: null
  }

  constructor(providerName: string) {
    this.kit = newKit(NETWORKS[providerName].provider)
  }

  async init (onChainChanged: (network: object) => any, onAccountsChanged: (account: string) => any) {
    await this.updateContracts()
    if ((window as { [key: string]: any })['ethereum']) {
      this.provider = await detectEthereumProvider()
      if (this.provider) {
        if (this.provider.isMetaMask) {
          this.web3 = new Web3(this.provider)
          if (onAccountsChanged) {
            this.provider.on('accountsChanged', onAccountsChanged)
          }
        } else {
          console.error('other ethereum wallet did not support.')
        }
      }
    } else if ((window as { [key: string]: any })['celo']) {
      this.provider = (window as { [key: string]: any })['celo']
      if ((window as { [key: string]: any })['celo'].isDesktop) {
        this.web3 = new Web3(this.provider)
        this.provider.on('chainChanged', (chainId: string) => {
          const INDEX: any = {
            '42220': { name: 'Mainnet' },
            '44787': { name: 'Alfajores' },
            '62320': { name: 'Baklava' }
          }          
          this.changeNetwork(INDEX[chainId].name)
          if (onChainChanged) {
            onChainChanged(INDEX[chainId].name)
          }
        })
        if (onAccountsChanged) {
          this.provider.on('accountsChanged', onAccountsChanged)
        }
      }      
    }
    if (onAccountsChanged) {
      const address = await this.getAccount()
      onAccountsChanged(address)
    }
  }

  async changeNetwork (providerName: string) {
    if (!this.provider.isDesktop) {
      this.kit = null
      this.kit = newKit(NETWORKS[providerName].provider)
      await this.updateContracts()  
    }
  }

  private async updateContracts () {
    for(const key in this.contracts) {
      this.contracts[key] = null    
    }
    this.contracts.erc20 = new this.kit.web3.eth.Contract(ERC20ABI)
    this.contracts.goldToken = await this.kit._web3Contracts.getGoldToken()
    this.contracts.stableToken = await this.kit._web3Contracts.getStableToken()
    this.contracts.exchange = await this.kit._web3Contracts.getExchange()
  }

  async getAccount (): Promise <string> {
    let accounts = []
    if (this.provider.isMetaMask || this.provider.isDesktop) {
      accounts = await this.web3.eth.getAccounts()
    } else if (this.provider.isDesktop) {
      const provider = this.provider
      const temp = () => {
        return new Promise((resolve, reject) => {
          provider.getAccount(resolve, reject)
        })
      }
      accounts = [(await temp())]
    }
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

  async estimateFee (web3Tx: any): Promise<String> {
    const gas = await this.estimateGas(web3Tx)
    const price = await this.kit.web3.eth.getGasPrice()
    return this.kit.web3.utils.fromWei(this.kit.web3.utils.toBN(gas).mul(this.kit.web3.utils.toBN(price)))
  }

  private async sendTransactionMetaMask (web3Tx: any): Promise<TransactionResult> {
    try {
      const celoTx = await _rlpEncodedTx(this.kit, web3Tx)
      const signature = await this.web3.eth.sign(getHashFromEncoded(celoTx.rlpEncode), celoTx.transaction.from)
  
      const v = this.kit.web3.utils.hexToNumber(`0x${signature.slice(130)}`) + chainIdTransformationForSigning(celoTx.transaction.chainId)
      const r = Buffer.from(signature.slice(2, 66), 'hex')
      const s = Buffer.from(signature.slice(66, 130), 'hex')
  
      const encodeTx = await encodeTransaction(celoTx, { v, s, r })
  
      return toTxResult(this.kit.web3.eth.sendSignedTransaction(encodeTx.raw))
    } catch (error) {
      throw new Error(error)
    }
  }

  async sendTransaction (web3Tx: any): Promise<TransactionReceipt | null> {
    let txReceipt = null
    if (this.provider.isMetaMask) {
      txReceipt = (await this.sendTransactionMetaMask(web3Tx)).waitReceipt()
    } else if (this.provider.isDesktop) {
      txReceipt = await this.kit.web3.eth.sendTransaction(web3Tx)
    } else if (this.provider.isMobile) {
      const provider = this.provider
      const temp = () => {
        return new Promise((resolve, reject) => {
          provider.sendTransaction(web3Tx, resolve, reject)
        })
      }
      const tx = await temp()
      txReceipt = toTxResult(this.kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    }
    return txReceipt
  }

  async sign (message:string, account: string): Promise<string | null> {
    if (this.provider.isMetaMask || this.provider.isDesktop) {
      return (await this.web3.eth.personal.sign(message, account))
    }
    // TODO: valora not support sign message
    return null
  }
}
