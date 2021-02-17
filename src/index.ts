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

	private desktopProvider: any = null;

	private metamaskProvider: any = null;

	private transport: any = null;

	private wallet: ReadOnlyWallet | null = null;

	public contracts: { [name: string]: any } = {
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
			await this.transport.on('disconnect', () => {
				this.transport = null;
			});
		}
		if (this.desktopProvider) {
			this.desktopProvider.removeAllListeners();
		}
		if (this.metamaskProvider) {
			this.metamaskProvider.removeAllListeners();
		}
		if (localStorage) {
			localStorage.setItem('CeloWebSigner', '');
		}
		this.isConnected = false;
	}

	async connectCelo(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (type: string, accounts: Address[]) => void,
		// eslint-disable-next-line no-unused-vars
		onChainChanged: (networkName: string) => void
	) {
		if ((window as { [key: string]: any }).celo) {
			const provider: any = (window as { [key: string]: any }).celo;
			if (provider.isDesktop) {
				const INDEX: { [key: string]: string } = {
					'0xa4ec': 'Mainnet',
					'42220': 'Mainnet',
					'0xaef3': 'Alfajores',
					'44787': 'Alfajores',
					'0xf370': 'Baklava',
					'62320': 'Baklava',
				};
				await provider.enable();
				const chainIdHex = await provider.request({ method: 'eth_chainId' });
				const chainName = INDEX[chainIdHex];
				this.kit = newKit(NETWORKS[chainName].provider);
				this.network = NETWORKS[chainName];
				provider.on('accountsChanged', (accounts: Array<Address>) => {
					if (onAccountsChanged) {
						onAccountsChanged('celo', accounts);
					}
				});
				provider.on('networkChanged', (chainIdDecimal: string) => {
					// https://github.com/MetaMask/metamask-extension/issues/8226
					const newChainName = INDEX[chainIdDecimal];
					if (newChainName) {
						this.kit = newKit(NETWORKS[newChainName].provider);
						this.network = NETWORKS[newChainName];
						if (onChainChanged) {
							onChainChanged(newChainName);
						}
					}
				});
				if (onAccountsChanged) {
					const web3 = new Web3(provider);
					const accounts = await web3.eth.getAccounts();
					onAccountsChanged('celo', accounts);
				}
				if (onChainChanged) {
					onChainChanged(chainName);
				}
				if (localStorage) {
					localStorage.setItem('CeloWebSigner', 'celo');
				}
				this.desktopProvider = provider;
				this.isConnected = true;
			} else if (provider.isMobile) {
				const web3 = new Web3(this.network.provider);
				this.wallet = await newDAppBrowserWalletWithSetup(web3, provider);
				this.kit = newKitFromWeb3(web3, this.wallet);
				if (onAccountsChanged) {
					const accounts = this.wallet.getAccounts();
					onAccountsChanged('mobile', accounts);
				}
				if (localStorage) {
					localStorage.setItem('CeloWebSigner', 'celo');
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
		onAccountsChanged: (type: string, accounts: Address[]) => void
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
					onAccountsChanged('metamask', accounts);
				}
				if (localStorage) {
					localStorage.setItem('CeloWebSigner', 'metamask');
				}
				this.metamaskProvider = provider;
				this.isConnected = true;
			} else {
				throw new Error('other ethereum wallet did not support.');
			}
		}
		return this.isConnected;
	}

	async connectLedgerUSB(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (type: string, accounts: Address[]) => void
	) {
		if (await TransportWebUSB.isSupported()) {
			const transport = await TransportWebUSB.create();
			await this.ledgerSetup('usb', transport, onAccountsChanged);
		}
		return this.isConnected;
	}

	async connectLedgerBLE(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (type: string, accounts: Address[]) => void
	) {
		if (await BluetoothTransport.isSupported()) {
			const transport = await BluetoothTransport.create();
			await this.ledgerSetup('ble', transport, onAccountsChanged);
		}
		return this.isConnected;
	}

	private async ledgerSetup(
		type: string,
		transport: any,
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (_type: string, accounts: Address[]) => void
	) {
		this.transport = transport;
		this.wallet = await newLedgerWalletWithSetup(transport);
		const address = this.wallet.getAccounts();
		if (address.length > 0) {
			const web3 = new Web3(this.network.provider);
			this.kit = newKitFromWeb3(web3, this.wallet);
			if (onAccountsChanged) {
				onAccountsChanged(type, address);
			}
			if (localStorage) {
				localStorage.setItem('CeloWebSigner', type);
			}
			this.isConnected = true;
		}
	}

	async reConnect(
		// eslint-disable-next-line no-unused-vars
		onAccountsChanged: (type: string, accounts: Address[]) => void,
		// eslint-disable-next-line no-unused-vars
		onChainChanged: (networkName: string) => void
	) {
		if (!this.isConnected) {
			if (localStorage) {
				switch (localStorage.getItem('CeloWebSigner')) {
					case 'metamask':
						await this.connectMetaMask(onAccountsChanged);
						break;
					case 'usb':
						await this.connectLedgerUSB(onAccountsChanged);
						break;
					case 'ble':
						await this.connectLedgerBLE(onAccountsChanged);
						break;
					case 'celo':
						await this.connectCelo(onAccountsChanged, onChainChanged);
						break;
					default:
						break;
				}
			}
		}
		return this.isConnected;
	}

	async changeNetwork(network: Network) {
		if (!this.desktopProvider) {
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
		if (this.wallet) {
			const temp = this.wallet ? this.wallet.getAccounts() : [];
			const account: Address[] = [];
			temp.forEach((address) => account.push(this.kit.web3.utils.toChecksumAddress(address)));
			return this.wallet ? this.wallet.getAccounts() : [];
		}
		if (this.desktopProvider) {
			const web3 = new Web3(this.desktopProvider);
			const accounts = await web3.eth.getAccounts();
			return accounts;
		}
		return [];
	}

	async sendTransaction(web3Tx: any): Promise<CeloTxReceipt> {
		try {
			if (this.wallet) {
				const txResult: TransactionResult = await this.kit.sendTransaction(web3Tx);
				return txResult.waitReceipt();
			}
			if (this.desktopProvider) {
				const txHash = await this.desktopProvider.request({
					method: 'eth_sendTransaction',
					params: [web3Tx],
				});
				for (let i = 0; i < 50; i += 1) {
					// eslint-disable-next-line no-await-in-loop
					const receipt = await this.kit.web3.eth.getTransactionReceipt(txHash);
					if (!receipt) {
						// eslint-disable-next-line no-await-in-loop
						await new Promise((resolve) => setTimeout(resolve, 5000));
						// eslint-disable-next-line no-continue
						continue;
					}
					return receipt;
				}
			}
			throw new Error('time out');
		} catch (error) {
			throw new Error(error);
		}
	}

	async sign(message: string, account: Address): Promise<string | null> {
		if (this.wallet) {
			const result = await this.wallet.signPersonalMessage(account, this.kit.web3.utils.toHex(message));
			let v = this.kit.web3.utils.hexToNumber(`0x${result.slice(130)}`);
			if (v < 27) {
				v += 27;
			}
			return result.slice(0, 130).concat(v.toString(16));
		}
		if (this.desktopProvider) {
			const sig = await this.desktopProvider.request({
				method: 'personal_sign',
				params: [message, account],
			});
			return sig;
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

	async erc20balanceOf(tokenAddress: Address, account: Address): Promise<string> {
		const temp = await this.kit.web3.eth.call({
			to: tokenAddress,
			data: this.contracts.erc20.methods.balanceOf(account).encodeABI(),
		});
		return temp !== '0x' ? this.kit.web3.eth.abi.decodeParameter('uint256', temp).toString() : '';
	}
}
