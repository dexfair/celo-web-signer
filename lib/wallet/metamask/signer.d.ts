/// <reference types="node" />
import { Address, Signer as _Signer, RLPEncodedTx } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
export declare class Signer implements _Signer {
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
    signTypedData: (typedData: EIP712TypedData) => Promise<{
        v: number;
        r: Buffer;
        s: Buffer;
    }>;
    getNativeKey: () => string;
    decrypt: (_ciphertext: Buffer) => Promise<Buffer>;
    computeSharedSecret: (_publicKey: string) => Promise<Buffer>;
}
