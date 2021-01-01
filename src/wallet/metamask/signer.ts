import { Address, Signer as _Signer, RLPEncodedTx } from '@celo/connect';
import { getHashFromEncoded } from '@celo/wallet-base';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';

export class Signer implements _Signer {
	private web3: any;

	private account: Address;

	constructor(web3: any, account: Address) {
		this.web3 = web3;
		this.account = account;
	}

	async signTransaction(addToV: number, encodedTx: RLPEncodedTx): Promise<{ v: number; r: Buffer; s: Buffer }> {
		const signature = await this.web3.eth.sign(getHashFromEncoded(encodedTx.rlpEncode), encodedTx.transaction.from);

		const v = this.web3.utils.hexToNumber(`0x${signature.slice(130)}`) + (addToV - 27);
		const r = Buffer.from(signature.slice(2, 66), 'hex');
		const s = Buffer.from(signature.slice(66, 130), 'hex');

		return { v, s, r };
	}

	async signPersonalMessage(data: string): Promise<{ v: number; r: Buffer; s: Buffer }> {
		const signature = await this.web3.eth.personal.sign(data, this.account);

		const v = this.web3.utils.hexToNumber(`0x${signature.slice(130)}`);
		const r = Buffer.from(signature.slice(2, 66), 'hex');
		const s = Buffer.from(signature.slice(66, 130), 'hex');

		return { v, s, r };
	}

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
