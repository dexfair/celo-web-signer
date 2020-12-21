import { Address, ReadOnlyWallet, Signer, RLPEncodedTx } from '@celo/connect'
import { WalletBase } from '@celo/wallet-base'
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils'
// @ts-ignore-next-line
import { bytes as Bytes, hash as Hash, RLP } from 'eth-lib'

export class DAppBrowserSigner implements Signer {
  private web3: any
  private mobile: any

  constructor(web3: any, mobile: any) {
    this.web3 = web3
    this.mobile = mobile
  }

  async signTransaction(
    addToV: number,
    encodedTx: RLPEncodedTx
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const chainId = encodedTx.transaction.chainId ? encodedTx.transaction.chainId : (await this.web3.eth.getChainId())
    const temp = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        this.mobile.sendTransaction(encodedTx.transaction, resolve, reject)
      })
    }
    const signature: string = await temp()

    console.log(addToV) // TODO - test

    const v = this.web3.utils.hexToNumber(`0x${signature.slice(130)}`) + (chainId * 2 + 8)
    const r = Buffer.from(signature.slice(2, 66), 'hex')
    const s = Buffer.from(signature.slice(66, 130), 'hex')

    return { v, s, r}
  }

  async signPersonalMessage(data: string): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('Not implemented')
  }

  async signTypedData(typedData: EIP712TypedData): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('Not implemented')
  }

  getNativeKey(): string {
    throw new Error('Not implemented')
    return ''
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

export class DAppBrowserWallet extends WalletBase<DAppBrowserSigner> implements ReadOnlyWallet {
  private web3: any
  private mobile: any
  private accounts: Address[] = []

  constructor(web3: any, mobile: any) {
    super()
    this.web3 = web3
    this.mobile = mobile
  }

  async init() {
    const temp = (): Promise<Address> => {
      return new Promise((resolve, reject) => {
        this.mobile.getAccount(resolve, reject)
      })
    }
    this.accounts.forEach(address => { this.removeSigner(address) })
    this.accounts = [(await temp())]
    this.accounts.forEach(address => { this.addSigner(address, new DAppBrowserSigner(this.web3, address)) })
  }

  getAccounts(): Address[] {
    return this.accounts
  }

  addAccount(address: string) {
    throw new Error('Not implemented')
  }
}

export async function newDAppBrowserWalletWithSetup(
  web3: any,
  mobile: any): Promise<DAppBrowserWallet> {
  const wallet = new DAppBrowserWallet(web3, mobile)
  await wallet.init()
  return wallet
}
