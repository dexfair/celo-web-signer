import { Address, ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { Signer } from './signer';
export declare class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
    private web3;
    private mobile;
    private accounts;
    constructor(web3: any, mobile: any);
    init(): Promise<void>;
    getAccounts(): Address[];
}
export declare function newDAppBrowserWalletWithSetup(web3: any, mobile: any): Promise<Wallet>;
