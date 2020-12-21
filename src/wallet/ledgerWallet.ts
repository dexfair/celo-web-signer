import { ReadOnlyWallet, Signer, RLPEncodedTx } from '@celo/connect'
import { WalletBase } from '@celo/wallet-base'
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils'
const Ledger = require('@ledgerhq/hw-app-eth').default

export class LedgerSigner implements Signer {
  // https://github.com/celo-org/celo-monorepo/blob/master/packages/sdk/wallets/wallet-ledger/src/ledger-signer.ts
  // legder version problem (@ledgerhq/hw-app-eth@5.35.1)
  private ledger: any
  private path: string

  constructor(ledger: any, path: string) {
    this.ledger = ledger
    this.path = path
  }

  async signTransaction(
    addToV: number,
    encodedTx: RLPEncodedTx
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const signature = await this.ledger.signTransaction(this.path, encodedTx.rlpEncode.slice(2))

    // EIP155 support. check/recalc signature v value.
    const rv = parseInt(signature.v, 16)
    // tslint:disable-next-line: no-bitwise
    if (rv !== addToV && (rv & addToV) !== rv) {
      addToV += 1 // add signature v bit.
    }
    signature.v = addToV.toString(10)
    return {
      v: signature.v,
      r: Buffer.from(signature.r, 'hex'),
      s: Buffer.from(signature.s, 'hex'),
    }
  }

  async signPersonalMessage(data: string): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const signature = await this.ledger!.signPersonalMessage( this.path, data.replace('0x', ''))
    return {
      v: signature.v,
      r: Buffer.from(signature.r, 'hex'),
      s: Buffer.from(signature.s, 'hex'),
    }
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

export class LedgerWallet extends WalletBase<LedgerSigner> implements ReadOnlyWallet {
  private ledger: any
  private path: string = '44\'/52752\'/0\'/0/'

  constructor(transport: any) {
    super()
    this.ledger = new Ledger(transport)
  }

  async init(count: number) {
    const temp = this.getAccounts()
    temp.forEach(address => { this.removeSigner(address) })
    for (let i = 0; i < count; i++) {
      const path = this.path + i.toString()
      const { address } = await this.ledger.getAddress(path)
      this.addSigner(address, new LedgerSigner(this.ledger, path))
    }
  }
}

export async function newLedgerWalletWithSetup(transport: any, count: number = 1): Promise<LedgerWallet> {
  const wallet = new LedgerWallet(transport)
  await wallet.init(count)
  return wallet
}
