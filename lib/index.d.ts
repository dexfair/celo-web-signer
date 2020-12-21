import { ContractKit } from '@celo/contractkit';
import { Address, AbiItem, CeloTxReceipt } from '@celo/connect';
interface Network {
    provider: string;
    blockscout?: string;
}
export declare const NETWORKS: object;
export declare const ERC20ABI: AbiItem[];
export declare class Celo {
    protected kit: ContractKit | null;
    protected isConnected: boolean;
    private isDesktop;
    private wallet;
    protected contracts: any;
    connect(network: Network, onChainChanged: (network: object) => any, onAccountsChanged: (accounts: Address[]) => any): Promise<void>;
    connectLedger(network: Network, onAccountsChanged: (accounts: Address[]) => any): Promise<void>;
    private ledgerSetup;
    changeNetwork(network: Network): Promise<void>;
    private updateContracts;
    getAccounts(): Promise<Address[]>;
    sendTransaction(web3Tx: any): Promise<CeloTxReceipt | null>;
    sign(message: string, account: Address): Promise<string | null>;
    recover(message: string, signature: string): Address | null;
}
export {};
