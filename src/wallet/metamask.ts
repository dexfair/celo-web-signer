import { Address, ReadOnlyWallet, Signer, RLPEncodedTx } from '@celo/connect'
import { WalletBase } from '@celo/wallet-base'
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils'
import { getHashFromEncoded } from '@celo/wallet-base'
// @ts-ignore-next-line
import { bytes as Bytes, hash as Hash, RLP } from 'eth-lib'

import Web3 from 'web3'

export class MetaMaskSigner implements Signer {
  private web3: any
  private account: Address

  constructor(web3: any, account: Address) {
    this.web3 = web3
    this.account = account
  }
      
  async signTransaction(
    addToV: number,
    encodedTx: RLPEncodedTx
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const signature = await this.web3.eth.sign(getHashFromEncoded(encodedTx.rlpEncode), encodedTx.transaction.from)

    const v = this.web3.utils.hexToNumber(`0x${signature.slice(130)}`) + ( addToV - 27 )
    const r = Buffer.from(signature.slice(2, 66), 'hex')
    const s = Buffer.from(signature.slice(66, 130), 'hex')

    return { v, s, r}
  }

  async signPersonalMessage(data: string): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const signature  = await this.web3.eth.personal.sign(data, this.account)

    const v = this.web3.utils.hexToNumber(`0x${signature.slice(130)}`)
    const r = Buffer.from(signature.slice(2, 66), 'hex')
    const s = Buffer.from(signature.slice(66, 130), 'hex')

    return { v, s, r}
  }

  async signTypedData(typedData: EIP712TypedData): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('Not implemented')
  }

  getNativeKey(): string {
    throw new Error('Not implemented')
  }

  decrypt(_ciphertext: Buffer) {
    throw new Error('Not implemented')
    return Promise.resolve(Buffer.from([]))
  }

  computeSharedSecret(_publicKey: string) {
    throw new Error('Not implemented')
    return Promise.resolve(Buffer.from([]))
  }
}

export class MetaMaskWallet extends WalletBase<MetaMaskSigner> implements ReadOnlyWallet {
  private web3: any

  constructor(provider: any, onAccountsChanged: (accounts: Address[]) => any | undefined) {
    super()
    this.web3 = new Web3(provider)
    provider.on('accountsChanged', (accounts:Array<Address>) => {
      const temp = this.getAccounts()
      temp.forEach(address => { this.removeSigner(address) })
      accounts.forEach(address => { this.addSigner(address, new MetaMaskSigner(this.web3, address)) })
      if (onAccountsChanged) {
        onAccountsChanged(accounts)
      }
    })
  }

  async init() {
    const temp = this.getAccounts()
    temp.forEach(address => { this.removeSigner(address) })
    const accounts: Address[] = await this.web3.eth.getAccounts()
    accounts.forEach(address => { this.addSigner(address, new MetaMaskSigner(this.web3, address)) })
  }
}

export async function newMetaMaskWalletWithSetup(
  provider: any,
  onAccountsChanged: (accounts: Address[]) => any | undefined): Promise<MetaMaskWallet> {
  const wallet = new MetaMaskWallet(provider, onAccountsChanged)
  await wallet.init()
  return wallet
}
