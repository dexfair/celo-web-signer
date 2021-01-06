import { ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { Signer } from './signer';

const Ledger = require('./hw-app-celo/Celo').default;

export class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
	private ledger: any;

	private path: string = "44'/52752'/0'/0/";

	constructor(transport: any) {
		super();
		this.ledger = new Ledger(transport);
	}

	async init(count: number) {
		const temp = this.getAccounts();
		temp.forEach((address) => {
			this.removeSigner(address);
		});
		const temp1 = [];
		for (let i = 0; i < count; i += 1) {
			const path = this.path + i.toString();
			temp1.push(this.ledger.getAddress(path));
		}
		(await Promise.all(temp1)).forEach(({ address }, index) => {
			this.addSigner(address, new Signer(this.ledger, this.path + index.toString()));
		});
	}
}

export async function newLedgerWalletWithSetup(transport: any, count: number = 1): Promise<Wallet> {
	const wallet = new Wallet(transport);
	await wallet.init(count);
	return wallet;
}
