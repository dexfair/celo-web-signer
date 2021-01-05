import { newKitFromWeb3, ContractKit, newKit } from '@celo/contractkit';
import { Address, AbiItem, ReadOnlyWallet, TransactionResult, CeloTxReceipt } from '@celo/connect';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { ERC20ABI as erc20 } from './erc20.abi';
import { newLedgerWalletWithSetup } from './wallet/ledgerWallet/wallet';
import { newMetaMaskWalletWithSetup } from './wallet/metamask/wallet';
import { newDAppBrowserWalletWithSetup } from './wallet/dappbrowser/wallet';

const BluetoothTransport = require('@ledgerhq/hw-transport-web-ble').default;

interface Network {
	provider: string;
	blockscout?: string;
}

export const NETWORKS: { [key: string]: Network } = {
	Mainnet: {
		provider: 'https://rc1-forno.celo-testnet.org',
		blockscout: 'https://explorer.celo.org',
	},
	Alfajores: {
		provider: 'https://alfajores-forno.celo-testnet.org',
		blockscout: 'https://alfajores-blockscout.celo-testnet.org',
	},
	Baklava: {
		provider: 'https://baklava-forno.celo-testnet.org',
		blockscout: 'https://baklava-blockscout.celo-testnet.org',
	},
};

export const ERC20ABI: AbiItem[] = erc20;

export class Celo {
	public kit: ContractKit;

	public isConnected: boolean = false;

	private network: Network;

	private isDesktop: boolean = false;

	private transport: any = null;

	private wallet: ReadOnlyWallet | null = null;

	public contracts: any = {
		erc20: null,
	};

	getSupport = async () => {
		const celo = !!(window as { [key: string]: any }).celo;
		const metamask =
			(window as { [key: string]: any }).ethereum && (window as { [key: string]: any }).ethereum.isMetaMask;
		const usb = await TransportWebUSB.isSupported();
		const ble = await BluetoothTransport.isSupported();
		return { celo, metamask, usb, ble };
	};

	getNetwork = (): Network => {
		return this.network;
	};

	constructor(network: Network) {
		this.network = network;
		this.kit = newKit(this.network.provider);
		this.contracts.erc20 = new this.kit.web3.eth.Contract(ERC20ABI);
	}

	async disconnect() {
		if (this.transport) {
			await this.transport.on('disconnect');
		}
		this.transport = null;
		this.isConnected = false;
	}

	async connectCelo(
		// eslint-disable-next-line no-unused-vars
		onChainChanged: (networkName: string) => void,
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (accounts: Address[]) => void
	) {
		if ((window as { [key: string]: any }).celo) {
			const provider: any = (window as { [key: string]: any }).celo;
			if (provider.isDesktop) {
				this.kit = newKit(this.network.provider);
				provider.on('accountsChanged', (accounts: Array<Address>) => {
					if (onAccountsChanged) {
						onAccountsChanged(accounts);
					}
				});
				provider.on('chainChanged', async (chainId: string) => {
					const INDEX: any = {
						'42220': { name: 'Mainnet' },
						'44787': { name: 'Alfajores' },
						'62320': { name: 'Baklava' },
					};
					if (onChainChanged) {
						onChainChanged(INDEX[chainId].name);
					}
				});
			} else if (provider.isMobile) {
				const web3 = new Web3(this.network.provider);
				this.wallet = await newDAppBrowserWalletWithSetup(web3, provider);
				this.kit = newKitFromWeb3(web3, this.wallet);
				if (onAccountsChanged) {
					const accounts = this.wallet.getAccounts();
					onAccountsChanged(accounts);
				}
				this.isConnected = true;
			} else {
				throw new Error('other celo wallet did not support.');
			}
		}
		return this.isConnected;
	}

	async connectMetaMask(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (accounts: Address[]) => void
	) {
		if ((window as { [key: string]: any }).ethereum) {
			if ((window as { [key: string]: any }).ethereum.isMetaMask) {
				await (window as { [key: string]: any }).ethereum.enable();
			}
			const provider: any = await detectEthereumProvider({ mustBeMetaMask: true });
			if (provider && provider.isMetaMask) {
				const web3 = new Web3(this.network.provider);
				this.wallet = await newMetaMaskWalletWithSetup(provider, onAccountsChanged);
				this.kit = newKitFromWeb3(web3, this.wallet);
				if (onAccountsChanged) {
					const accounts = this.wallet.getAccounts();
					onAccountsChanged(accounts);
				}
				this.isConnected = true;
			} else {
				throw new Error('other ethereum wallet did not support.');
			}
		}
		return this.isConnected;
	}

	async connectLedgerUSB(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (accounts: Address[]) => void
	) {
		if (await TransportWebUSB.isSupported()) {
			const transport = await TransportWebUSB.create();
			await this.ledgerSetup(transport, onAccountsChanged);
		}
		return this.isConnected;
	}

	async connectLedgerBLE(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (accounts: Address[]) => void
	) {
		if (await BluetoothTransport.isSupported()) {
			const transport = await BluetoothTransport.create();
			await this.ledgerSetup(transport, onAccountsChanged);
		}
		return this.isConnected;
	}

	private async ledgerSetup(
		transport: any,
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (accounts: Address[]) => void
	) {
		this.transport = transport;
		this.wallet = await newLedgerWalletWithSetup(transport);
		const address = this.wallet.getAccounts();
		if (address.length > 0) {
			const web3 = new Web3(this.network.provider);
			this.kit = newKitFromWeb3(web3, this.wallet);
			if (onAccountsChanged) {
				onAccountsChanged(address);
			}
			this.isConnected = true;
		}
	}

	async changeNetwork(network: Network) {
		if (!this.isDesktop) {
			this.network = network;
			if (this.wallet) {
				const web3 = new Web3(this.network.provider);
				this.kit = newKitFromWeb3(web3, this.wallet);
			} else {
				this.kit = newKit(this.network.provider);
			}
		}
	}

	async getAccounts(): Promise<Address[]> {
		if (this.isDesktop) {
			const result = await this.kit.web3.eth.getAccounts();
			return result;
		}
		return this.wallet ? this.wallet.getAccounts() : [];
	}

	async sendTransaction(web3Tx: any): Promise<CeloTxReceipt> {
		try {
			const txResult: TransactionResult = await this.kit.sendTransaction(web3Tx);
			return txResult.waitReceipt();
		} catch (error) {
			throw new Error(error);
		}
	}

	async sign(message: string, account: Address): Promise<string | null> {
		if (this.wallet) {
			const result = await this.wallet.signPersonalMessage(account, this.kit.web3.utils.toHex(message));
			return result;
		}
		return null;
	}

	recover(message: string, signature: string): Address {
		try {
			const result = this.kit.web3.eth.accounts.recover(this.kit.web3.utils.toHex(message), signature);
			return result;
		} catch (error) {
			throw new Error(error);
		}
	}
}
