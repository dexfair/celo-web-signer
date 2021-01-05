import { ContractKit } from '@celo/contractkit';
import { Address, AbiItem, CeloTxReceipt } from '@celo/connect';
interface Network {
    provider: string;
    blockscout?: string;
}
export declare const NETWORKS: {
    [key: string]: Network;
};
export declare const ERC20ABI: AbiItem[];
export declare class Celo {
    kit: ContractKit;
    isConnected: boolean;
    private network;
    private isDesktop;
    private transport;
    private wallet;
    contracts: any;
    getSupport: () => Promise<{
        celo: boolean;
        metamask: any;
        usb: boolean;
        ble: any;
    }>;
    getNetwork: () => Network;
    constructor(network: Network);
    disconnect(): Promise<void>;
    connectCelo(onChainChanged: (networkName: string) => void, onAccountsChanged: (accounts: Address[]) => void): Promise<boolean>;
    connectMetaMask(onAccountsChanged: (accounts: Address[]) => void): Promise<boolean>;
    connectLedgerUSB(onAccountsChanged: (accounts: Address[]) => void): Promise<boolean>;
    connectLedgerBLE(onAccountsChanged: (accounts: Address[]) => void): Promise<boolean>;
    private ledgerSetup;
    changeNetwork(network: Network): Promise<void>;
    private updateContracts;
    getAccounts(): Promise<Address[]>;
    sendTransaction(web3Tx: any): Promise<CeloTxReceipt>;
    sign(message: string, account: Address): Promise<string | null>;
    recover(message: string, signature: string): Address;
}
export {};
