"use strict";
exports.__esModule = true;
exports.Celo = exports.ERC20ABI = exports.NETWORKS = void 0;
var tslib_1 = require("tslib");
var contractkit_1 = require("@celo/contractkit");
var web3_1 = tslib_1.__importDefault(require("web3"));
var detect_provider_1 = tslib_1.__importDefault(require("@metamask/detect-provider"));
var hw_transport_webusb_1 = tslib_1.__importDefault(require("@ledgerhq/hw-transport-webusb"));
// import { detect } from  'detect-browser'
var erc20_abi_1 = require("./erc20.abi");
var ledgerWallet_1 = require("./wallet/ledgerWallet");
var metamask_1 = require("./wallet/metamask");
var dappbrowser_1 = require("./wallet/dappbrowser");
exports.NETWORKS = {
    Mainnet: { provider: 'https://rc1-forno.celo-testnet.org', blockscout: 'https://explorer.celo.org' },
    Alfajores: { provider: 'https://alfajores-forno.celo-testnet.org', blockscout: 'https://alfajores-blockscout.celo-testnet.org' },
    Baklava: { provider: 'https://baklava-forno.celo-testnet.org', blockscout: 'https://baklava-blockscout.celo-testnet.org' }
};
exports.ERC20ABI = erc20_abi_1.ERC20ABI;
var Celo = /** @class */ (function () {
    function Celo() {
        this.kit = null;
        this.isConnected = false;
        this.isDesktop = false;
        this.wallet = null;
        this.contracts = {
            erc20: null,
            goldToken: null,
            stableToken: null,
            exchange: null
        };
    }
    Celo.prototype.connect = function (network, onChainChanged, onAccountsChanged) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var provider, web3, _a, accounts, provider, web3, _b, accounts;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!window['celo']) return [3 /*break*/, 6];
                        provider = window['celo'];
                        if (!provider.isDesktop) return [3 /*break*/, 1];
                        this.kit = contractkit_1.newKit(network.provider);
                        provider.on('accountsChanged', function (accounts) {
                            if (onAccountsChanged) {
                                onAccountsChanged(accounts);
                            }
                        });
                        provider.on('chainChanged', function (chainId) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var INDEX;
                            return tslib_1.__generator(this, function (_a) {
                                INDEX = {
                                    '42220': { name: 'Mainnet' },
                                    '44787': { name: 'Alfajores' },
                                    '62320': { name: 'Baklava' }
                                };
                                if (onChainChanged) {
                                    onChainChanged(INDEX[chainId].name);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        return [3 /*break*/, 5];
                    case 1:
                        if (!provider.isMobile) return [3 /*break*/, 4];
                        web3 = new web3_1["default"](network.provider);
                        _a = this;
                        return [4 /*yield*/, dappbrowser_1.newDAppBrowserWalletWithSetup(web3, provider)];
                    case 2:
                        _a.wallet = _c.sent();
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                        return [4 /*yield*/, this.updateContracts()];
                    case 3:
                        _c.sent();
                        if (onAccountsChanged) {
                            accounts = this.wallet.getAccounts();
                            onAccountsChanged(accounts);
                        }
                        this.isConnected = true;
                        return [3 /*break*/, 5];
                    case 4: throw new Error('other celo wallet did not support.');
                    case 5: return [3 /*break*/, 13];
                    case 6:
                        if (!window['ethereum']) return [3 /*break*/, 13];
                        if (!window['ethereum'].isMetaMask) return [3 /*break*/, 8];
                        return [4 /*yield*/, window['ethereum'].enable()];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8: return [4 /*yield*/, detect_provider_1["default"]({ mustBeMetaMask: true })];
                    case 9:
                        provider = _c.sent();
                        if (!(provider && provider.isMetaMask)) return [3 /*break*/, 12];
                        web3 = new web3_1["default"](network.provider);
                        _b = this;
                        return [4 /*yield*/, metamask_1.newMetaMaskWalletWithSetup(provider, onAccountsChanged)];
                    case 10:
                        _b.wallet = _c.sent();
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                        return [4 /*yield*/, this.updateContracts()];
                    case 11:
                        _c.sent();
                        if (onAccountsChanged) {
                            accounts = this.wallet.getAccounts();
                            onAccountsChanged(accounts);
                        }
                        this.isConnected = true;
                        return [3 /*break*/, 13];
                    case 12: throw new Error('other ethereum wallet did not support.');
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.connectLedger = function (network, onAccountsChanged) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_1, transport;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!window['celo'] || !window['celo'].isMobile)) return [3 /*break*/, 10];
                        return [4 /*yield*/, hw_transport_webusb_1["default"].isSupported()];
                    case 1:
                        if (!(_a.sent())) return [3 /*break*/, 10];
                        return [4 /*yield*/, hw_transport_webusb_1["default"].list()];
                    case 2:
                        if (!((_a.sent()).length === 0)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, window['navigator'].usb.requestDevice({ filters: [{ vendorId: '0x2c97' }] })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.log(new Error(error_1));
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, hw_transport_webusb_1["default"].list()];
                    case 7:
                        if (!((_a.sent()).length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, hw_transport_webusb_1["default"].create()];
                    case 8:
                        transport = _a.sent();
                        return [4 /*yield*/, this.ledgerSetup(network, transport, onAccountsChanged)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.ledgerSetup = function (network, transport, onAccountsChanged) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, address, web3;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, ledgerWallet_1.newLedgerWalletWithSetup(transport)];
                    case 1:
                        _a.wallet = _b.sent();
                        address = this.wallet.getAccounts();
                        if (!(address.length > 0)) return [3 /*break*/, 3];
                        web3 = new web3_1["default"](network.provider);
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                        return [4 /*yield*/, this.updateContracts()];
                    case 2:
                        _b.sent();
                        if (onAccountsChanged) {
                            onAccountsChanged(address);
                        }
                        this.isConnected = true;
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.changeNetwork = function (network) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var web3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.isDesktop && this.kit && this.wallet)) return [3 /*break*/, 2];
                        web3 = new web3_1["default"](network.provider);
                        this.kit = contractkit_1.newKitFromWeb3(web3, this.wallet);
                        return [4 /*yield*/, this.updateContracts()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.updateContracts = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var key, _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        for (key in this.contracts) {
                            this.contracts[key] = null;
                        }
                        if (!this.kit) return [3 /*break*/, 4];
                        this.contracts.erc20 = new this.kit.web3.eth.Contract(exports.ERC20ABI);
                        _a = this.contracts;
                        return [4 /*yield*/, this.kit._web3Contracts.getGoldToken()];
                    case 1:
                        _a.goldToken = _d.sent();
                        _b = this.contracts;
                        return [4 /*yield*/, this.kit._web3Contracts.getStableToken()];
                    case 2:
                        _b.stableToken = _d.sent();
                        _c = this.contracts;
                        return [4 /*yield*/, this.kit._web3Contracts.getExchange()];
                    case 3:
                        _c.exchange = _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Celo.prototype.getAccounts = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isDesktop) return [3 /*break*/, 4];
                        if (!this.kit) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.kit.web3.eth.getAccounts()];
                    case 1:
                        _a = (_b.sent());
                        return [3 /*break*/, 3];
                    case 2:
                        _a = [];
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                    case 4: return [2 /*return*/, this.wallet ? this.wallet.getAccounts() : []];
                }
            });
        });
    };
    Celo.prototype.sendTransaction = function (web3Tx) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var txResult;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.kit) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.kit.sendTransaction(web3Tx)];
                    case 1:
                        txResult = _a.sent();
                        return [2 /*return*/, txResult.waitReceipt()];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    Celo.prototype.sign = function (message, account) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.kit && this.wallet)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.wallet.signPersonalMessage(account, this.kit.web3.utils.toHex(message))];
                    case 1: return [2 /*return*/, (_a.sent())];
                    case 2: return [2 /*return*/, null];
                }
            });
        });
    };
    Celo.prototype.recover = function (message, signature) {
        if (this.kit) {
            var result = this.kit.web3.eth.accounts.recover(this.kit.web3.utils.toHex(message), signature);
            return result;
        }
        return null;
    };
    return Celo;
}());
exports.Celo = Celo;
