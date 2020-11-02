import { TransactionReceipt } from 'web3-core';
export declare const NETWORK: any;
export declare class Celo {
    protected kit: any;
    protected web3: any;
    protected provider: any;
    init(providerName: string, onChainChanged: (network: object) => any, onAccountsChanged: (account: string) => any): Promise<void>;
    changeNetwork(providerName: string): void;
    getAccount(): Promise<string>;
    estimateGas(web3Tx: any): Promise<number>;
    private sendTransactionMetaMask;
    sendTransaction(web3Tx: any): Promise<TransactionReceipt | null>;
}
