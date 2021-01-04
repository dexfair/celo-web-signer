import { ReadOnlyWallet } from '@celo/connect';
import { WalletBase } from '@celo/wallet-base';
import { Signer } from './signer';
export declare class Wallet extends WalletBase<Signer> implements ReadOnlyWallet {
    private ledger;
    private path;
    constructor(transport: any);
    init(count: number): Promise<void>;
}
export declare function newLedgerWalletWithSetup(transport: any, count?: number): Promise<Wallet>;
