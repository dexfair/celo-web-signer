/// <reference types="node" />
import { ReadOnlyWallet, Signer, RLPEncodedTx } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
export declare class LedgerSigner implements Signer {
    private ledger;
    private path;
    constructor(ledger: any, path: string);
    signTransaction(addToV: number, encodedTx: RLPEncodedTx): Promise<{
        v: number;
        r: Buffer;
        s: Buffer;
    }>;
    signPersonalMessage(data: string): Promise<{
        v: number;
        r: Buffer;
        s: Buffer;
    }>;
    signTypedData(typedData: EIP712TypedData): Promise<{
        v: number;
        r: Buffer;
        s: Buffer;
    }>;
    getNativeKey(): string;
    decrypt(_ciphertext: Buffer): Promise<Buffer>;
    computeSharedSecret(_publicKey: string): Promise<Buffer>;
}
export declare class LedgerWallet extends WalletBase<LedgerSigner> implements ReadOnlyWallet {
    private ledger;
    private path;
    constructor(transport: any);
    init(count: number): Promise<void>;
}
export declare function newLedgerWalletWithSetup(transport: any, count?: number): Promise<LedgerWallet>;
