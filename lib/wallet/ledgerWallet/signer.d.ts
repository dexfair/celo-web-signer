/// <reference types="node" />
import { Signer as _Signer, RLPEncodedTx } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
export declare class Signer implements _Signer {
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
    signTypedData: (typedData: EIP712TypedData) => Promise<{
        v: number;
        r: Buffer;
        s: Buffer;
    }>;
    getNativeKey: () => string;
    decrypt: (_ciphertext: Buffer) => Promise<Buffer>;
    computeSharedSecret: (_publicKey: string) => Promise<Buffer>;
}
