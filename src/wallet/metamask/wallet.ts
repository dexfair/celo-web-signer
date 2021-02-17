import { Address, ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import Web3 from 'web3';
import { Signer } from './signer';

export class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
	private web3: Web3;

	// eslint-disable-next-line no-unused-vars
	constructor(provider: any, onAccountsChanged: (type: string, accounts: Address[]) => void | undefined) {
		super();
		this.web3 = new Web3(provider);
		provider.on('accountsChanged', (accounts: Array<Address>) => {
			const temp = this.getAccounts();
			temp.forEach((address) => {
				this.removeSigner(address);
			});
			accounts.forEach((address) => {
				this.addSigner(address, new Signer(this.web3, address));
			});
			if (onAccountsChanged) {
				onAccountsChanged('metamask', accounts);
			}
		});
	}

	async init() {
		const temp = this.getAccounts();
		temp.forEach((address) => {
			this.removeSigner(address);
		});
		const accounts: Address[] = await this.web3.eth.getAccounts();
		accounts.forEach((address) => {
			this.addSigner(address, new Signer(this.web3, address));
		});
	}
}

export async function newMetaMaskWalletWithSetup(
	provider: any,
	// eslint-disable-next-line no-unused-vars
	onAccountsChanged: (type: string, accounts: Address[]) => void | undefined
): Promise<Wallet> {
	const wallet = new Wallet(provider, onAccountsChanged);
	await wallet.init();
	return wallet;
}
