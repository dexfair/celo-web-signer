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
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import TransportU2F from '@ledgerhq/hw-transport-u2f'
// @ts-ignore-next-line
import { bytes as Bytes, hash as Hash, RLP } from 'eth-lib'
import { ERC20ABI as erc20} from './erc20.abi'

const Ledger = require('@ledgerhq/hw-app-eth').default

function chainIdTransformationForSigning(chainId: number): number {
  return chainId * 2 + 8
}

async function createLedgerProvider (transport: any, type: string) {
  const ledger = new Ledger(transport)
  const provider = {
    isLedger: true,
    type,
    index: 0,
    getPath: (index: any) => { return `44'/52752'/0'/0/${index}` },
    getAccount: ledger.getAddress,
    signTransaction: ledger.signTransaction,
    signPersonalMessage: ledger.signPersonalMessage
  }
  try {
    await provider.getAccount(provider.getPath(0))
    return provider
  } catch (error) {
    console.log(new Error(error))
  }
  return null
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

interface Network {
  provider: string
  blockscout?: string
}

export const NETWORKS: object = {
  Mainnet: { provider: 'https://rc1-forno.celo-testnet.org', blockscout: 'https://explorer.celo.org' },
  Alfajores: { provider: 'https://alfajores-forno.celo-testnet.org', blockscout: 'https://alfajores-blockscout.celo-testnet.org' },
  Baklava: { provider: 'https://baklava-forno.celo-testnet.org', blockscout: 'https://baklava-blockscout.celo-testnet.org' }
}

export const ERC20ABI: Array<object> = erc20;

export class Celo {
  protected kit: any
  protected web3: any
  protected provider: any
  protected isEnable: boolean = false

  protected contracts: any = {
    erc20: null,
    goldToken: null,
    stableToken: null,
    exchange: null
  }

  constructor(network: Network) {
    this.kit = newKit(network.provider)
  }

  async connect (onChainChanged: (network: object) => any, onAccountsChanged: (account: string) => any) {
    await this.updateContracts()

    if (!this.isEnable && (await TransportWebUSB.isSupported())){
      if ((await TransportWebUSB.list()).length === 0) {
        try {
          await (window as { [key: string]: any })['navigator'].usb.requestDevice({filters: [{ vendorId: '0x2c97' }]})          
        } catch (error) {
          console.log(new Error(error))
        }
      }
      if ((await TransportWebUSB.list()).length > 0) {
        const transport = await TransportWebUSB.create()
        this.provider = await createLedgerProvider(transport, 'usb')
        this.isEnable = this.provider ? true : false
      }
    }

    if (!this.isEnable && (await TransportU2F.isSupported()) && (await TransportU2F.list()).length > 0){
      const transport = await TransportU2F.create()
      this.provider = await createLedgerProvider(transport, 'u2f')
      this.isEnable = this.provider ? true : false
    }

    if (!this.isEnable && (window as { [key: string]: any })['celo']) {
      this.provider = (window as { [key: string]: any })['celo']
      if ((window as { [key: string]: any })['celo'].isDesktop) {
        this.web3 = new Web3(this.provider)
        this.provider.on('chainChanged', async (chainId: string) => {
          const INDEX: any = {
            '42220': { name: 'Mainnet' },
            '44787': { name: 'Alfajores' },
            '62320': { name: 'Baklava' }
          }          
          await this.changeNetwork(INDEX[chainId].name)
          if (onChainChanged) {
            onChainChanged(INDEX[chainId].name)
          }
        })
        if (onAccountsChanged) {
          this.provider.on('accountsChanged', (accounts:Array<string>) => { onAccountsChanged(accounts[0]) })
        }
        this.isEnable = true
      } else if ((window as { [key: string]: any })['celo'].isMobile) {
        this.isEnable = true
      }
    } else if (!this.isEnable && (window as { [key: string]: any })['ethereum']) {
      if ((window as { [key: string]: any })['ethereum'].isMetaMask) {
        await (window as { [key: string]: any })['ethereum'].enable()
      }
      this.provider = await detectEthereumProvider()
      if (this.provider) {
        if (this.provider.isMetaMask) {
          this.web3 = new Web3(this.provider)
          if (onAccountsChanged) {
            this.provider.on('accountsChanged', (accounts:Array<string>) => { onAccountsChanged(accounts[0]) })
          }
          this.isEnable = true
        } else {
          console.error('other ethereum wallet did not support.')
        }
      }
    }

    if (this.isEnable && onAccountsChanged) {
      const address = await this.getAccount()
      onAccountsChanged(address)
    }

    return this.isEnable
  }

  async changeNetwork (network: Network) {
    if (!this.provider.isDesktop) {
      this.kit = null
      this.kit = newKit(network.provider)
      await this.updateContracts()  
    }
  }

  private async updateContracts () {
    for(const key in this.contracts) {
      this.contracts[key] = null    
    }
    this.contracts.erc20 = new this.kit.web3.eth.Contract(ERC20ABI)
    this.contracts.goldToken = (await this.kit.contracts.getGoldToken()).contract
    this.contracts.stableToken = (await this.kit.contracts.getStableToken()).contract
    this.contracts.exchange = (await this.kit.contracts.getExchange()).contract
  }

  async getAccount (): Promise <string> {
    let accounts = []
    if (this.provider.isMetaMask || this.provider.isDesktop) {
      accounts = await this.web3.eth.getAccounts()
    } else if (this.provider.isMobile) {
      const provider = this.provider
      const temp = () => {
        return new Promise((resolve, reject) => {
          provider.getAccount(resolve, reject)
        })
      }
      accounts = [(await temp())]
    } else if (this.provider.isLedger) {
      const result = await this.provider.getAccount(this.provider.getPath(this.provider.index))
      accounts = [result.address]
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
      web3Tx.chainId = await this.kit.web3.eth.getChainId()
      const temp = () => {
        return new Promise((resolve, reject) => {
          provider.sendTransaction(web3Tx, resolve, reject)
        })
      }
      const tx = await temp()
      txReceipt = toTxResult(this.kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    } else if (this.provider.isLedger) {
      const celoTx = await _rlpEncodedTx(this.kit, web3Tx)
      const signature = await this.provider.signTransaction(this.provider.getPath(this.provider.index), celoTx.rlpEncode.slice(2))

      let addToV = celoTx.transaction.chainId * 2 + 35
      const rv = parseInt(signature.v, 16)
      if (rv !== addToV && (rv & addToV) !== rv) {
        addToV += 1
      }

      const v = addToV
      const r = Buffer.from(signature.r, 'hex')
      const s = Buffer.from(signature.s, 'hex')

      const encodeTx = await encodeTransaction(celoTx, { v, s, r })
      txReceipt = toTxResult(this.kit.web3.eth.sendSignedTransaction(encodeTx.raw)).waitReceipt()
    }
    return txReceipt
  }

  async sign (message:string, account: string): Promise<string | null> {
    if (this.provider.isMetaMask || this.provider.isDesktop) {
      return (await this.web3.eth.personal.sign(message, account))
    } else if (this.provider.isMobile) {
      // TODO: valora not support sign message
    } else if (this.provider.isLedger) {
      // TODO: not tested
      let {v, s, r} = await this.provider.sign(this.provider.getPath(this.provider.index), Buffer.from(message).toString('hex'))
      v = (v - 27).toString(16)
      if (v.length < 2) {
        v = `0${v}`
      }
      return `0x${r}${s}${v}`
    }
    return null
  }
}
