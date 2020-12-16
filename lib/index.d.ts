import { TransactionReceipt } from 'web3-core';
interface Network {
    provider: string;
    blockscout?: string;
}
export declare const NETWORKS: object;
export declare const ERC20ABI: Array<object>;
export declare class Celo {
    protected kit: any;
    protected web3: any;
    protected provider: any;
    protected isEnable: boolean;
    protected chainId: any;
    protected contracts: any;
    constructor(network: Network);
    connect(onChainChanged: (network: object) => any, onAccountsChanged: (account: string) => any): Promise<boolean>;
    changeNetwork(network: Network): Promise<void>;
    private updateContracts;
    getAccount(): Promise<string>;
    private fillTxDefaults;
    private rlpEncodedTx;
    estimateGas(web3Tx: any): Promise<string | number>;
    estimateFee(web3Tx: any): Promise<String>;
    private sendTransactionMetaMask;
    sendTransaction(web3Tx: any): Promise<TransactionReceipt | null>;
    sign(message: string, account: string): Promise<string | null>;
}
export {};
