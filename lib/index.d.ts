import { TransactionResult } from '@celo/contractkit/lib/utils/tx-result';
export declare class Celo {
    protected kit: any;
    protected web3: any;
    init(provider: string, onAccountsChanged: (account: string) => any): Promise<void>;
    changeNetwork(provider: string): void;
    getAccount(): Promise<string>;
    estimateGas(web3Tx: any): Promise<number>;
    sendTransaction(web3Tx: any): Promise<TransactionResult>;
}
