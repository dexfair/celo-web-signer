import { TransactionReceipt } from 'web3-core';
export declare class Celo {
    protected kit: any;
    protected web3: any;
    protected provider: any;
    init(provider: string, onAccountsChanged: (account: string) => any): Promise<void>;
    changeNetwork(provider: string): void;
    getAccount(): Promise<string>;
    estimateGas(web3Tx: any): Promise<number>;
    private sendTransactionMetaMask;
    sendTransaction(web3Tx: any): Promise<TransactionReceipt | null>;
}
