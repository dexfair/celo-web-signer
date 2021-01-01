import { Signer as _Signer, RLPEncodedTx } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';

export class Signer implements _Signer {
	// https://github.com/celo-org/celo-monorepo/blob/master/packages/sdk/wallets/wallet-ledger/src/ledger-signer.ts
	// legder version problem (@ledgerhq/hw-app-eth@5.35.1)
	private ledger: any;

	private path: string;

	constructor(ledger: any, path: string) {
		this.ledger = ledger;
		this.path = path;
	}

	async signTransaction(addToV: number, encodedTx: RLPEncodedTx): Promise<{ v: number; r: Buffer; s: Buffer }> {
		const signature = await this.ledger.signTransaction(this.path, encodedTx.rlpEncode.slice(2));

		// EIP155 support. check/recalc signature v value.
		const rv = parseInt(signature.v, 16);
		// eslint-disable-next-line no-bitwise
		if (rv !== addToV && (rv & addToV) !== rv) {
			// eslint-disable-next-line no-param-reassign
			addToV += 1; // add signature v bit.
		}
		signature.v = addToV.toString(10);
		return {
			v: signature.v,
			r: Buffer.from(signature.r, 'hex'),
			s: Buffer.from(signature.s, 'hex'),
		};
	}

	async signPersonalMessage(data: string): Promise<{ v: number; r: Buffer; s: Buffer }> {
		const signature = await this.ledger!.signPersonalMessage(this.path, data.replace('0x', ''));
		return {
			v: signature.v,
			r: Buffer.from(signature.r, 'hex'),
			s: Buffer.from(signature.s, 'hex'),
		};
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
