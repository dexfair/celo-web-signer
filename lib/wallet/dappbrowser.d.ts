/// <reference types="node" />
import { Address, ReadOnlyWallet, Signer, RLPEncodedTx } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
export declare class DAppBrowserSigner implements Signer {
    private web3;
    private mobile;
    constructor(web3: any, mobile: any);
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
export declare class DAppBrowserWallet extends WalletBase<DAppBrowserSigner> implements ReadOnlyWallet {
    private web3;
    private mobile;
    private accounts;
    constructor(web3: any, mobile: any);
    init(): Promise<void>;
    getAccounts(): Address[];
    addAccount(address: string): void;
}
export declare function newDAppBrowserWalletWithSetup(web3: any, mobile: any): Promise<DAppBrowserWallet>;
