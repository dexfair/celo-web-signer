import { Signer as _Signer, RLPEncodedTx } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';

export class Signer implements _Signer {
	private web3: any;

	private mobile: any;

	constructor(web3: any, mobile: any) {
		this.web3 = web3;
		this.mobile = mobile;
	}

	async signTransaction(addToV: number, encodedTx: RLPEncodedTx): Promise<{ v: number; r: Buffer; s: Buffer }> {
		const chainId = encodedTx.transaction.chainId ? encodedTx.transaction.chainId : await this.web3.eth.getChainId();
		const temp = (): Promise<string> => {
			return new Promise((resolve, reject) => {
				this.mobile.sendTransaction(encodedTx.transaction, resolve, reject);
			});
		};
		const signature: string = await temp();

		// eslint-disable-next-line no-console
		console.log(addToV); // TODO - test

		const v = this.web3.utils.hexToNumber(`0x${signature.slice(130)}`) + (chainId * 2 + 8);
		const r = Buffer.from(signature.slice(2, 66), 'hex');
		const s = Buffer.from(signature.slice(66, 130), 'hex');

		return { v, s, r };
	}

	signPersonalMessage = (data: string): Promise<{ v: number; r: Buffer; s: Buffer }> => {
		throw new Error(`Not implemented. ${data}`);
	};

	signTypedData = async (typedData: EIP712TypedData): Promise<{ v: number; r: Buffer; s: Buffer }> => {
		throw new Error(`Not implemented. ${typedData.message}`);
	};

	getNativeKey = (): string => {
		throw new Error('Not implemented');
	};

	decrypt = (_ciphertext: Buffer) => {
		throw new Error(`Not implemented. ${_ciphertext}`);
		return Promise.resolve(Buffer.from([]));
	};

	computeSharedSecret = (_publicKey: string) => {
		throw new Error(`Not implemented. ${_publicKey}`);
		return Promise.resolve(Buffer.from([]));
	};
}
