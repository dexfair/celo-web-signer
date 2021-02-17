import { Address, ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import Web3 from 'web3';
import { Signer } from './signer';
export declare class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
    private web3;
    private mobile;
    private accounts;
    constructor(web3: Web3, mobile: any);
    init(): Promise<void>;
    getAccounts(): Address[];
}
export declare function newDAppBrowserWalletWithSetup(web3: Web3, mobile: any): Promise<Wallet>;
