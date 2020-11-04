import { TransactionReceipt } from 'web3-core';
export declare const NETWORKS: any;
export declare const ERC20ABI: Array<object>;
export declare class Celo {
    protected kit: any;
    protected web3: any;
    protected provider: any;
    protected contracts: any;
    constructor(providerName: string);
    init(onChainChanged: (network: object) => any, onAccountsChanged: (account: string) => any): Promise<void>;
    changeNetwork(providerName: string): Promise<void>;
    private updateContracts;
    getAccount(): Promise<string>;
    estimateGas(web3Tx: any): Promise<number>;
    estimateFee(web3Tx: any): Promise<String>;
    private sendTransactionMetaMask;
    sendTransaction(web3Tx: any): Promise<TransactionReceipt | null>;
    sign(message: string, account: string): Promise<string | null>;
}
