/// <reference types="node" />
import { Address, ReadOnlyWallet, Signer, RLPEncodedTx } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
export declare class MetaMaskSigner implements Signer {
    private web3;
    private account;
    constructor(web3: any, account: Address);
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
export declare class MetaMaskWallet extends WalletBase<MetaMaskSigner> implements ReadOnlyWallet {
    private web3;
    constructor(provider: any, onAccountsChanged: (accounts: Address[]) => any | undefined);
    init(): Promise<void>;
}
export declare function newMetaMaskWalletWithSetup(provider: any, onAccountsChanged: (accounts: Address[]) => any | undefined): Promise<MetaMaskWallet>;
