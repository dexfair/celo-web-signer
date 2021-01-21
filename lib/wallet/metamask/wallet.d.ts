import { Address, ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { Signer } from './signer';
export declare class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
    private web3;
    constructor(provider: any, onAccountsChanged: (type: string, accounts: Address[]) => void | undefined);
    init(): Promise<void>;
}
export declare function newMetaMaskWalletWithSetup(provider: any, onAccountsChanged: (type: string, accounts: Address[]) => void | undefined): Promise<Wallet>;
