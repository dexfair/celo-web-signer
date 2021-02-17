import { Address, ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import Web3 from 'web3';
import { Signer } from './signer';

export class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
	private web3: Web3;

	private mobile: any;

	private accounts: Address[] = [];

	constructor(web3: Web3, mobile: any) {
		super();
		this.web3 = web3;
		this.mobile = mobile;
	}

	async init() {
		const temp = (): Promise<Address> => {
			return new Promise((resolve, reject) => {
				this.mobile.getAccount(resolve, reject);
			});
		};
		this.accounts.forEach((address) => {
			this.removeSigner(address);
		});
		this.accounts = [await temp()];
		this.accounts.forEach((address) => {
			this.addSigner(address, new Signer(this.web3, this.mobile));
		});
	}

	getAccounts(): Address[] {
		return this.accounts;
	}
	/*
	addAccount(address: string) {
		throw new Error(`Not implemented. ${address}`);
  }
  */
}

export async function newDAppBrowserWalletWithSetup(web3: Web3, mobile: any): Promise<Wallet> {
	const wallet = new Wallet(web3, mobile);
	await wallet.init();
	return wallet;
}
